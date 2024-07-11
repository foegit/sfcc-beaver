import { ThemeColor, ThemeIcon, TreeItem } from 'vscode';
import { HookImplementationType } from './HookObserver';

export class HookDetailsTreeItem extends TreeItem {
    public hook: HookImplementationType;

    constructor(hook: HookImplementationType) {
        const parsedLocation = /^.*\/(.*)\/cartridge(.*)$/.exec(hook.location);
        const cartridge = parsedLocation
            ? parsedLocation[1]
            : 'Unknown cartridge';

        super(cartridge);

        this.description = parsedLocation ? parsedLocation[2] : '';

        this.hook = hook;
        this.contextValue = 'hookFileItem';
        this.iconPath = hook.connected
            ? new ThemeIcon('code')
            : new ThemeIcon('bracket-error', new ThemeColor('charts.red'));
        this.command = {
            command: 'sfccBeaver.openHookFile',
            arguments: [this],
            title: 'Open Hook',
        };
    }
}
