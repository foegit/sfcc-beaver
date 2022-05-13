import * as vscode from 'vscode';
import SFCCProject from '../SFCCProject';
import CartridgeItem from './treeItems/CartridgeTreeItem';

export class CartridgesObserver implements vscode.TreeDataProvider<vscode.TreeItem> {
    private sfccProject = new SFCCProject();

    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(): Promise<vscode.TreeItem[]> {
        const startTime = new Date();

        const sfccCartridges = await this.sfccProject.getSortedCartridges();

        const endTime = new Date();
        console.debug(`It took ${(endTime.valueOf() - startTime.valueOf()) / 1000} sec to find cartridges`);

        const treeItems : vscode.TreeItem[] = sfccCartridges.map(cartridge => {
            return new CartridgeItem(cartridge);
        });

        return treeItems;
    }
}


