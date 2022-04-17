import * as vscode from 'vscode';
import * as fg from 'fast-glob';
import * as fs from 'fs';
import path = require('path');

import SFCCCartridge from './SFCCCartridge';

export default class SFCCProject {

    cartridges : SFCCCartridge[] = [];

    constructor() {
        console.log('SFCC Project Initialized');
    }

    getCartridges(): SFCCCartridge[] {
        if(!vscode.workspace.workspaceFolders) {
            return [];
        }

        if (this.cartridges.length === 0) {
            const [ workspaceFolder ] = vscode.workspace.workspaceFolders;

            // .project files indicate cartridges root
            const foundProjectFiles = fg.sync('**/.project', {
                cwd: workspaceFolder.uri.fsPath,
                ignore: ['**/node_modules/**']
            });

            this.cartridges = foundProjectFiles.map(filepath => {
                const projectFileFullPath = path.resolve(workspaceFolder.uri.fsPath, filepath);
                const cartridgePath = projectFileFullPath.replace(`${path.sep}.project`, '');

                const cartridge = new SFCCCartridge(cartridgePath);

                return cartridge;
            });
        }

        return this.cartridges;
    }
}