import * as vscode from 'vscode';
import SFCCProject from '../SFCCProject';
import JobsTreeItem from './treeItems/JobsTreeItem';

export class JobsObserver implements vscode.TreeDataProvider<vscode.TreeItem> {
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
        return Promise.resolve([new JobsTreeItem()]);
    }
}


