import * as vscode from 'vscode';
import SFCCProject from '../SFCCProject';

export class DepNodeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	private sfccProject = new SFCCProject();

	private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(): vscode.TreeItem[] {
		const cartridges = this.sfccProject.getCartridges();

		const treeItems : vscode.TreeItem[] = cartridges.map(cartridge => {
			return new vscode.TreeItem(`🌳 ${cartridge.getName()}`);
		});

		return treeItems;
	}
}


export class SimpleItem extends vscode.TreeItem {
	constructor(text: string) {
		super(text);
	}
}

