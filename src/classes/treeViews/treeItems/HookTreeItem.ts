import { ThemeIcon, TreeItem } from 'vscode';
import * as vscode from 'vscode';

import { HookSFCCDefinitionType, ParsedHookType } from '../HookObserver';

export class HookTreeSubItem extends TreeItem {
    constructor(hook: HookSFCCDefinitionType) {
        super(hook.name);
    }
}

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

    async getChildren(element: any): Promise<vscode.TreeItem[]> {
        return this.hook.hooks.hooks.map((hook) => new HookTreeSubItem(hook));
    }
}
