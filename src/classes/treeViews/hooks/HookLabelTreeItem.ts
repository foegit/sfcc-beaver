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

function typeToDisplayValue(hookType: HookTypes) {
    switch (hookType) {
        case HookTypes.system:
            return 'system';
        case HookTypes.commerceApi:
            return 'API';
        default:
            return 'custom';
    }
}

function getDescription(hookPoint: HookPoint) {
    const amount = hookPoint.implementation.length;
    const type = getHookType(hookPoint.name);

    return `${typeToDisplayValue(type)} · ${
        amount === 1 ? '1 extend' : `${amount} extends`
    }`;
}

export default class HookLabelTreeItem extends TreeItem {
    constructor(public hookPoint: HookPoint) {
        super(hookPoint.name, TreeItemCollapsibleState.Collapsed);

        this.description = getDescription(hookPoint);
        this.iconPath = getIcon(hookPoint);
        this.contextValue = 'hookLabelTreeItem';
    }
}
