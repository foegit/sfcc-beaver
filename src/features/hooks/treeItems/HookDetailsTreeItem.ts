import { ThemeColor, ThemeIcon, TreeItem } from 'vscode';
import { HookImplementation } from '../hooksHelpers';
import PathTool from '../../../classes/tools/PathTool';
import { parseCartridgePath } from '../../cartridgesView/cartridgesHelpers';

export class HookDetailsTreeItem extends TreeItem {
  constructor(public hookImplementation: HookImplementation) {
    const parsedLocation = parseCartridgePath(hookImplementation.location);

    super(parsedLocation.cartridge);

    this.description = parsedLocation.cartridgeRelatedPath;
    this.contextValue = 'hookFileItem';
    this.iconPath = hookImplementation.connected
      ? new ThemeIcon('code')
      : new ThemeIcon('code', new ThemeColor('charts.red'));
    this.command = {
      command: 'sfccBeaver.hooks.openImplementation',
      arguments: [this],
      title: 'Open Hook Implementation',
    };
  }
}
