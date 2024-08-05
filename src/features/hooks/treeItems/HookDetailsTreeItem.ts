import { ThemeColor, ThemeIcon, TreeItem } from 'vscode';
import { ERR_NOT_FOUND_HOOK_IMPLEMENTATION, HookImplementation } from '../hooksHelpers';
import { parseCartridgePath } from '../../cartridgesView/cartridgesHelpers';

export class HookDetailsTreeItem extends TreeItem {
  constructor(public hookImplementation: HookImplementation) {
    const parsedLocation = parseCartridgePath(hookImplementation.location);

    super(parsedLocation.cartridge);

    this.description = this.getDescription(parsedLocation);
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

  getDescription(parsedLocation: ReturnType<typeof parseCartridgePath>) {
    if (this.hookImplementation.connected) {
      return parsedLocation.cartridgeRelatedPath;
    }

    return ERR_NOT_FOUND_HOOK_IMPLEMENTATION;
  }
}
