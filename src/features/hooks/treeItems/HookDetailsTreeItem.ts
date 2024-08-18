import { ThemeColor, ThemeIcon, TreeItem } from 'vscode';
import { ERR_NOT_FOUND_HOOK_IMPLEMENTATION, HookImplementation } from '../hooksHelpers';

export class HookDetailsTreeItem extends TreeItem {
  constructor(public hookImplementation: HookImplementation) {
    super(hookImplementation.cartridge);

    this.description = this.getDescription();
    this.contextValue = 'hookFileItem';
    this.iconPath = hookImplementation.connected
      ? new ThemeIcon('code')
      : new ThemeIcon('code', new ThemeColor('charts.red'));

    this.command = {
      command: hookImplementation.connected
        ? 'sfccBeaver.hooks.openImplementation'
        : 'sfccBeaver.hooks.openHookDefinition',
      arguments: [this],
      title: 'Open Hook Implementation',
    };
  }

  getDescription() {
    if (this.hookImplementation.connected) {
      return this.hookImplementation.cartridgeRelatedPath;
    }

    return ERR_NOT_FOUND_HOOK_IMPLEMENTATION;
  }
}
