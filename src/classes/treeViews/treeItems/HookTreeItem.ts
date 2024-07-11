import { ThemeIcon, TreeItem } from 'vscode';
import * as vscode from 'vscode';

import { HookImplementationType, ParsedHookType } from '../HookObserver';

export default class HookTreeItem extends TreeItem {
    public hook: ParsedHookType;

    constructor(hook: ParsedHookType) {
        super(hook.cartridge, vscode.TreeItemCollapsibleState.Collapsed);
        this.hook = hook;

        this.contextValue = hook.hooksFile;
        this.iconPath = new ThemeIcon('cloud');
    }

    public getName() {
        return this.hook.cartridge;
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }
}
