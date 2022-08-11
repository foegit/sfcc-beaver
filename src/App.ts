// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fg from 'fast-glob';
import path = require('path');

import BeaverError, { ErrCodes } from './classes/errors/BeaverError';
import SettingTool from './classes/tools/SettingTool';
import { CartridgesObserver } from './classes/treeViews/CartridgeObserver';
import { JobsObserver } from './classes/treeViews/JobsObserver';
import CartridgeTreeItem from './classes/treeViews/treeItems/CartridgeTreeItem';
import { copyInclude, copyUnixPath } from './commands/copy';
import { overrideFile } from './commands/override';
import HoverManager from './classes/hover/HoverManager';

class App {
    public uniqueTime: string;
    public workspaceState?: vscode.Memento;

    constructor() {
        this.uniqueTime = String(Date.now()) + Math.random();
        console.debug('App created', this.uniqueTime);
    }

    public activate(context: vscode.ExtensionContext) {
        const copyPathCommand = vscode.commands.registerCommand('sfccBeaver.extract', copyInclude);
        const overrideFileCommand = vscode.commands.registerCommand('sfccBeaver.override', overrideFile);
        const copyUnixPathCommand = vscode.commands.registerCommand('sfccBeaver.unixpath', copyUnixPath);
        const cartridgesObserver = new CartridgesObserver();
        const jobsObserver = new JobsObserver();
        vscode.window.registerTreeDataProvider('cartridgesObserver', cartridgesObserver);

        if (false) {
            vscode.window.registerTreeDataProvider('jobsObserver', jobsObserver);
        }

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

        // Samples of `window.registerTreeDataProvider`

        // TODO: one day give it an explanation
        context.subscriptions.push(copyPathCommand);
        context.subscriptions.push(overrideFileCommand);
        context.subscriptions.push(copyUnixPathCommand);

        HoverManager.init(context);

        this.workspaceState = context.workspaceState;
        this.indexCartridges();
    }

    public async indexCartridges(): Promise<void> {
        if(!vscode.workspace.workspaceFolders) {
            throw new BeaverError(ErrCodes.noActiveEditor);
        }

        const [ workspaceFolder ] = vscode.workspace.workspaceFolders;

        const projectFiles = await fg('**/.project', {
            cwd: workspaceFolder.uri.fsPath,
            ignore: ['**/node_modules/**', '**/cartridge/**', '**/test/mocks/**']
        });

        const cartridges = projectFiles.map(filepath => {
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
