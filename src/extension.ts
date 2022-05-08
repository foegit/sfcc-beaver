// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import SettingTool from './classes/tools/SettingTool';
import { CartridgesObserver } from './classes/treeViews/CartridgeObserver';
import { JobsObserver } from './classes/treeViews/JobsObserver';
import CartridgeTreeItem from './classes/treeViews/treeItems/CartridgeTreeItem';
import { copyInclude, copyUnixPath } from './commands/copy';
import { overrideFile } from './commands/override';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const copyPathCommand = vscode.commands.registerCommand('sfccBeaver.extract', copyInclude);
    const overrideFileCommand = vscode.commands.registerCommand('sfccBeaver.override', overrideFile);
    const copyUnixPathCommand = vscode.commands.registerCommand('sfccBeaver.unixpath', copyUnixPath);
    const cartridgesObserver = new CartridgesObserver();
    const jobsObserver = new JobsObserver();
    vscode.window.registerTreeDataProvider('cartridgesObserver', cartridgesObserver);
    vscode.window.registerTreeDataProvider('jobsObserver', jobsObserver);
    vscode.commands.registerCommand('sfccBeaver.refreshCartridgeList', () => {
        cartridgesObserver.refresh();
    });
    vscode.commands.registerCommand('sfccBeaver.addCartridgeToFavorite', (cartridgeItem: CartridgeTreeItem) => {
        SettingTool.addCartridgeToFavorite(cartridgeItem.getName());
        cartridgesObserver.refresh();
    });

    // Samples of `window.registerTreeDataProvider`

    // TODO: one day give it an explanation
    context.subscriptions.push(copyPathCommand);
    context.subscriptions.push(overrideFileCommand);
    context.subscriptions.push(copyUnixPathCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {}
