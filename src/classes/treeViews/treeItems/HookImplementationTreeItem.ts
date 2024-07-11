import { ThemeIcon, TreeItem } from 'vscode';
import * as vscode from 'vscode';

import {
    HookImplementationType,
    HookSFCCDefinitionType,
    HookType,
} from '../HookObserver';

export class HookImplementationSubTreeItem extends TreeItem {
    public hook: HookImplementationType;

    constructor(hook: HookImplementationType) {
        super(hook.location);
        this.hook = hook;
        this.contextValue = 'hookFileItem';
        this.iconPath = hook.connected
            ? new ThemeIcon('pass')
            : new ThemeIcon('close', new vscode.ThemeColor('charts.red'));
        this.command = {
            command: 'sfccBeaver.openHookFile',
            arguments: [this],
            title: 'Open Hook',
        };
    }
}

export default class HookImplementationTreeItem extends TreeItem {
    public hook: HookType;

    constructor(hook: HookType) {
        super(hook.name, vscode.TreeItemCollapsibleState.Collapsed);

        this.hook = hook;

        this.contextValue = 'hookImplementation';
        this.iconPath = hook.name.startsWith('dw.')
            ? new ThemeIcon('cloud', new vscode.ThemeColor('charts.blue'))
            : new ThemeIcon(
                  'extensions',
                  new vscode.ThemeColor('charts.purple')
              );
    }

    public getName() {
        return this.hook.name;
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }
}
