import { TreeItem, TreeItemCollapsibleState } from 'vscode';

export default class JobsTreeItem extends TreeItem {
    constructor() {
        super('Jobs', TreeItemCollapsibleState.Collapsed);
    }

    contextValue = 'sfccJobTreeItem';
}