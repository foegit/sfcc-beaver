import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import {
  ERR_NOT_FOUND_HOOK_IMPLEMENTATION,
  getHookType,
  getIconNameForHook,
  HookPoint,
  hookPointHasDuplicates,
  hookPointHasMissingImp,
  HookTypes,
  WARN_DUPLICATED_HOOK_DEFINITION,
} from '../hooksHelpers';
import { colors, getPinnedIcon } from '../../../helpers/iconHelpers';
import { parseCartridgePath } from '../../cartridgesView/cartridgesHelpers';
import { compareSetting } from '../../../helpers/settings';

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
  public hasMissingImp: boolean;
  public hasDuplicatedImp: boolean;

  constructor(public hookPoint: HookPoint) {
    super(hookPoint.name);

    const compactModeActive = this.isInCompactMode();

    this.hasMissingImp = hookPointHasMissingImp(hookPoint);
    this.hasDuplicatedImp = hookPointHasDuplicates(hookPoint);
    this.collapsibleState = compactModeActive ? TreeItemCollapsibleState.None : TreeItemCollapsibleState.Collapsed;
    this.description = this.getDescription();
    this.contextValue = this.getContextValue();
    this.iconPath = this.getIcon();

    if (compactModeActive) {
      this.command = {
        command: this.hasMissingImp ? 'sfccBeaver.hooks.openHookDefinition' : 'sfccBeaver.hooks.openImplementation',
        arguments: [this],
        title: 'Open Hook Implementation',
      };
    }
  }

  getDescription() {
    const type = getHookType(this.hookPoint.name);
    const hookDisplayType = typeToDisplayValue(type);

    if (this.hasMissingImp) {
      return ERR_NOT_FOUND_HOOK_IMPLEMENTATION;
    }

    if (this.hasDuplicatedImp) {
      return WARN_DUPLICATED_HOOK_DEFINITION;
    }

    if (this.isInCompactMode()) {
      const hookImplementation = this.hookPoint.implementation[0];
      const parsedCartridge = parseCartridgePath(hookImplementation.location);

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

  getIcon() {
    if (this.hasMissingImp) {
      return new ThemeIcon('flame', colors.red);
    }

    if (this.hasDuplicatedImp) {
      return new ThemeIcon('flame', colors.orange);
    }

    if (this.hookPoint.pinned) {
      return getPinnedIcon();
    }

    const hookIconName = getIconNameForHook(this.hookPoint.name);

    switch (getHookType(this.hookPoint.name)) {
      case HookTypes.system:
        return new ThemeIcon(hookIconName, colors.blue);
      case HookTypes.commerceApi:
        return new ThemeIcon(hookIconName, colors.purple);
      default:
        return new ThemeIcon(hookIconName, colors.green);
    }
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
