import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { getHookType, HookPoint, HookTypes } from '../hooksHelpers';
import { colors, getPinnedIcon } from '../../../helpers/iconHelpers';

function getIcon(hookPoint: HookPoint) {
  if (hookPoint.implementation.some((i) => !i.connected)) {
    return new ThemeIcon('flame', colors.red);
  }

  if (hookPoint.pinned) {
    return getPinnedIcon();
  }

  switch (getHookType(hookPoint.name)) {
    case HookTypes.system:
      return new ThemeIcon('verified-filled', colors.blue);
    case HookTypes.commerceApi:
      return new ThemeIcon('verified-filled', colors.purple);
    default:
      return new ThemeIcon('file-code', colors.green);
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

  return `${typeToDisplayValue(type)} · ${amount === 1 ? '1 extend' : `${amount} extends`}`;
}

export default class HookLabelTreeItem extends TreeItem {
  constructor(public hookPoint: HookPoint) {
    super(hookPoint.name, TreeItemCollapsibleState.Collapsed);

    this.description = getDescription(hookPoint);
    this.iconPath = getIcon(hookPoint);
    this.contextValue = hookPoint.pinned ? 'hookLabelTreeItemPinned' : 'hookLabelTreeItem';
  }
}
