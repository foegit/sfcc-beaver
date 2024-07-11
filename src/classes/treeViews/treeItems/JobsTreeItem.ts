import { TreeItem, TreeItemCollapsibleState } from 'vscode';

export default class HookTypes extends TreeItem {
    constructor(hooksRegistry: Object[]) {
        super('Jobs', TreeItemCollapsibleState.Collapsed);
    }

    contextValue = 'sfccJobTreeItem';
}
