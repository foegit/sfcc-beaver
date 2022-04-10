// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { copyInclude } from './commands/copy';
import { DepNodeProvider as TestTreeProvider } from './classes/treeViews/BeaverDam';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const copyPathCommand = vscode.commands.registerCommand('sfccBeaver.extract', copyInclude);

	// Samples of `window.registerTreeDataProvider`
	const testTreeProvider = new TestTreeProvider();
	vscode.window.registerTreeDataProvider('beaverDam', testTreeProvider);

	context.subscriptions.push(copyPathCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {}
