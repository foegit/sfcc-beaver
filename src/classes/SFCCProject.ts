import * as vscode from 'vscode';
import * as fg from 'fast-glob';
import * as fs from 'fs';
import path = require('path');

import SFCCCartridge from './SFCCCartridge';

export default class SFCCProject {
    cartridges : SFCCCartridge[] = [];
    cartridgesCached : boolean = false;
    cartridgeHash : Map<string, SFCCCartridge> = new Map();

    constructor() {
        console.log('SFCC Project Initialized');
    }

    getCartridges(): SFCCCartridge[] {
        this.fetchCartridgesSync();

        return this.cartridges;
    }

    async getCartridgesAsync(useCache: boolean = true) : Promise<SFCCCartridge[]> {
        if(!vscode.workspace.workspaceFolders) {
            return Promise.resolve([]);
        }

        if (this.cartridgesCached && useCache) {
            return Promise.resolve(this.cartridges);
        }

        const [ workspaceFolder ] = vscode.workspace.workspaceFolders;

        const foundFiles = await fg('**/.project', {
            cwd: workspaceFolder.uri.fsPath,
            ignore: ['**/node_modules/**', '**/cartridge/**', '**/test/mocks/**']
        });

        this.cartridges = foundFiles.map(filepath => {
            const projectFileFullPath = path.resolve(workspaceFolder.uri.fsPath, filepath);
            const cartridgePath = projectFileFullPath.replace(`${path.sep}.project`, '');

            const cartridge = new SFCCCartridge(cartridgePath);
            return cartridge;
        });

        this.cartridgesCached = true;

        return this.cartridges;
    }

    async getSortedCartridgesAsync(useCache: boolean = false) {
        return SFCCCartridge.sortByPriority(await this.getCartridgesAsync(useCache));
    }

    fetchCartridgesSync() {
        if (!vscode.workspace.workspaceFolders || this.cartridgesCached) {
            return;
        }

        const [ workspaceFolder ] = vscode.workspace.workspaceFolders;


        const foundFiles = fg.sync('**/.project', {
            cwd: workspaceFolder.uri.fsPath,
            ignore: ['**/node_modules/**']
        });


        this.cartridges = foundFiles.map(filepath => {
            const projectFileFullPath = path.resolve(workspaceFolder.uri.fsPath, filepath);
            const cartridgePath = projectFileFullPath.replace(`${path.sep}.project`, '');

            const cartridge = new SFCCCartridge(cartridgePath);
            return cartridge;
        });

        this.cartridgesCached = true;
    }

    getCartridgeByName(name : string) : (SFCCCartridge|undefined) {
        this.fetchCartridgesSync();

        return this.cartridges.find(cartridge => cartridge.getName() === name);
    }
}