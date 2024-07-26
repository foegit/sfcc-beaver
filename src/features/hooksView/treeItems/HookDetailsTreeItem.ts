import { ThemeColor, ThemeIcon, TreeItem } from 'vscode';
import { HookImplementation } from '../hooksHelpers';
import PathTool from '../../../classes/tools/PathTool';

export class HookDetailsTreeItem extends TreeItem {
  constructor(public hookImplementation: HookImplementation) {
    const parsedLocation = /^.*\/(.*)\/cartridge(.*)$/.exec(PathTool.toPosixPath(hookImplementation.location));
    const cartridge = parsedLocation ? parsedLocation[1] : 'Unknown cartridge';

    super(cartridge);

    this.description = parsedLocation ? parsedLocation[2] : '';
    this.contextValue = 'hookFileItem';
    this.iconPath = hookImplementation.connected
      ? new ThemeIcon('code')
      : new ThemeIcon('code', new ThemeColor('charts.red'));
    this.command = {
      command: 'sfccBeaver.openHookFile',
      arguments: [this],
      title: 'Open Hook Implementation',
    };
  }
}
