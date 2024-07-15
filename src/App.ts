// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fg from 'fast-glob';
import path = require('path');

import BeaverError, { ErrCodes } from './classes/errors/BeaverError';
import SettingTool from './classes/tools/SettingTool';
import { CartridgesObserver } from './classes/treeViews/CartridgeObserver';
import CartridgeTreeItem from './classes/treeViews/treeItems/CartridgeTreeItem';
import HoverManager from './classes/hover/HoverManager';
import WebviewMgr from './webviewProviders/WebviewMgr';
import CommandMgr from './commands/CommandMgr';
import { HookObserver } from './classes/treeViews/hooks/HookObserver';
import FsTool from './classes/tools/FsTool';
import { HookDetailsTreeItem } from './classes/treeViews/hooks/HookDetailsTreeItem';

class App {
    public uniqueTime: string;
    public workspaceState?: vscode.Memento;

    constructor() {
        this.uniqueTime = String(Date.now()) + Math.random();
        console.debug('App created', this.uniqueTime);
    }

    public activate(context: vscode.ExtensionContext) {
        const cartridgesObserver = new CartridgesObserver();
        const hooksObserver = new HookObserver();

        vscode.window.registerTreeDataProvider('cartridgesObserver', cartridgesObserver);

        vscode.window.registerTreeDataProvider('hooksObserver', hooksObserver);

        vscode.commands.registerCommand('sfccBeaver.refreshCartridgeList', async () => {
            await this.indexCartridges();
            cartridgesObserver.refresh();
        });

        vscode.commands.registerCommand('sfccBeaver.pinCartridge', async (cartridgeItem: CartridgeTreeItem) => {
            await SettingTool.addPinnedCartridge(cartridgeItem.getName());
            await this.indexCartridges();
            cartridgesObserver.refresh();
        });

        vscode.commands.registerCommand('sfccBeaver.unpinCartridge', async (cartridgeItem: CartridgeTreeItem) => {
            await SettingTool.removePinnedCartridge(cartridgeItem.getName());
            await this.indexCartridges();
            cartridgesObserver.refresh();
        });

        CommandMgr.init(context);
        HoverManager.init(context);
        WebviewMgr.init(context);

        this.workspaceState = context.workspaceState;
        this.indexCartridges();

        vscode.commands.executeCommand('setContext', 'sfccBeaver.extActivated', true);
    }

    public async indexCartridges(): Promise<void> {
        if (!vscode.workspace.workspaceFolders) {
            throw new BeaverError(ErrCodes.noActiveEditor);
        }

        const [workspaceFolder] = vscode.workspace.workspaceFolders;

        const projectFiles = await fg('**/.project', {
            cwd: workspaceFolder.uri.fsPath,
            ignore: ['**/node_modules/**', '**/cartridge/**', '**/test/mocks/**'],
        });

        const cartridges = projectFiles.map((filepath) => {
            const projectFileFullPath = path.resolve(workspaceFolder.uri.fsPath, filepath);
            const cartridgePath = projectFileFullPath.replace(/[\/\\]\.project/, '');

            return cartridgePath;
        });

        this.memo('cartridgeList', cartridges);
    }

    public memo(key: string, value: any) {
        this.workspaceState && this.workspaceState.update(key, value);
    }

    public getMemo(key: string): any {
        return this.workspaceState?.get(key);
    }

    public async getCartridgeList(reIndex: boolean = true): Promise<string[]> {
        if (reIndex) {
            this.indexCartridges();
        }

        return this.getMemo('cartridgeList');
    }
}

export default new App();
