import {
    ThemeColor,
    ThemeIcon,
    TreeItem,
    TreeItemCollapsibleState,
} from 'vscode';
import { getHookType, HookPoint, HookTypes } from './hooksHelpers';

function getIcon(hookPoint: HookPoint) {
    if (hookPoint.implementation.some((i) => !i.connected)) {
        return new ThemeIcon('flame', new ThemeColor('charts.red'));
    }

    switch (getHookType(hookPoint.name)) {
        case HookTypes.system:
            return new ThemeIcon('cloud', new ThemeColor('charts.blue'));
        case HookTypes.commerceApi:
            return new ThemeIcon('database', new ThemeColor('charts.purple'));
        default:
            return new ThemeIcon('note', new ThemeColor('charts.green'));
    }
}

function getDescription(hook: HookPoint) {
    const amount = hook.implementation.length;

    return amount === 1 ? '(1 hook)' : `(${amount} hooks)`;
}

export default class HookLabelTreeItem extends TreeItem {
    constructor(public hookPoint: HookPoint) {
        super(hookPoint.name, TreeItemCollapsibleState.Collapsed);

        this.description = getDescription(hookPoint);
        this.iconPath = getIcon(hookPoint);
        this.contextValue = 'hookLabelTreeItem';
    }
}
