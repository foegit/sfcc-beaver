import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { getHookType, HookPoint, HookTypes } from '../hooksHelpers';
import { colors, getPinnedIcon } from '../../../helpers/iconHelpers';
import { parseCartridgePath } from '../../cartridgesView/cartridgesHelpers';
import { compareSetting } from '../../../helpers/settings';

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

export default class HookLabelTreeItem extends TreeItem {
  constructor(public hookPoint: HookPoint) {
    super(hookPoint.name);

    const compactModeActive = this.isInCompactMode();

    this.collapsibleState = compactModeActive ? TreeItemCollapsibleState.None : TreeItemCollapsibleState.Collapsed;
    this.description = this.getDescription();
    this.iconPath = getIcon(hookPoint);
    this.contextValue = this.getContextValue();

    if (compactModeActive) {
      this.command = {
        command: 'sfccBeaver.hooks.openImplementation',
        arguments: [this],
        title: 'Open Hook Implementation',
      };
    }
  }

  getDescription() {
    const type = getHookType(this.hookPoint.name);
    const hookDisplayType = typeToDisplayValue(type);

    if (this.isInCompactMode()) {
      const parsedCartridge = parseCartridgePath(this.hookPoint.implementation[0].location);

      return `${hookDisplayType} · ${parsedCartridge.cartridge}`;
    }

    const amount = this.hookPoint.implementation.length;

    return `${hookDisplayType} · ${amount === 1 ? '1 extend' : `${amount} extends`}`;
  }

  getContextValue() {
    const contextValueParts = ['hookLabelTreeItem'];

    if (this.isInCompactMode()) {
      contextValueParts.push('compact');
    }

    if (this.isPinned()) {
      contextValueParts.push('pinned');
    }

    return contextValueParts.join('_');
  }

  isInCompactMode() {
    if (compareSetting('hooks.singeHookViewMode', 'compact')) {
      return this.hookPoint.implementation.length === 1;
    }

    return false;
  }

  isPinned() {
    return this.hookPoint.pinned;
  }
}
