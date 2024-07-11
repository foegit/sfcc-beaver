import { ThemeIcon, TreeItem } from 'vscode';
import * as vscode from 'vscode';

import { HookType } from './HookObserver';

const systemHooks = [
    'dw.order.calculate',
    'dw.order.calculateShipping',
    'dw.order.calculateTax',
    'dw.system.request.onSession',
    'dw.system.request.onRequest',
];

function getIcon(hook: HookType) {
    if (hook.implementation.some((i) => !i.connected)) {
        return new ThemeIcon('bug', new vscode.ThemeColor('charts.red'));
    }

    if (systemHooks.includes(hook.name)) {
        return new ThemeIcon('cloud', new vscode.ThemeColor('charts.blue'));
    }

    if (hook.name.startsWith('dw.ocapi')) {
        return new ThemeIcon('database', new vscode.ThemeColor('charts.blue'));
    }

    return new ThemeIcon('plug', new vscode.ThemeColor('charts.purple'));
}

export default class HookLabelTreeItem extends TreeItem {
    public hook: HookType;

    constructor(hook: HookType) {
        super(hook.name, vscode.TreeItemCollapsibleState.Collapsed);

        this.hook = hook;
        this.description = hook.implementation.length.toString();

        this.contextValue = 'hookImplementation';
        this.iconPath = getIcon(hook);
    }

    public getName() {
        return this.hook.name + 'sss';
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }
}
