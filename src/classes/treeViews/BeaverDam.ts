import * as vscode from 'vscode';
import SFCCProject from '../SFCCProject';
import DamTree from './DamTree';

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

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        if (!element) {
            return Promise.resolve([new vscode.TreeItem('Cartridges', vscode.TreeItemCollapsibleState.Expanded)]);
        }

        const startTime = new Date();

        const sfccCartridges = await this.sfccProject.getSortedCartridgesAsync(false);


        const endTime = new Date();
        console.debug(`It took ${(endTime.valueOf() - startTime.valueOf()) / 1000} sec to find cartridges`);

        const treeItems : vscode.TreeItem[] = sfccCartridges.map(cartridge => {
            return new DamTree(cartridge);
        });

        return treeItems;
    }
}


