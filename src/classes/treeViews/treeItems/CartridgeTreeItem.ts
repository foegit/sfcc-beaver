import { TreeItem } from 'vscode';
import SFCCCartridge from '../../SFCCCartridge';
import * as path from 'path';

export default class CartridgeTreeItem extends TreeItem {
    private sfccCartridge: SFCCCartridge;

    constructor(sfccCartridge: SFCCCartridge) {
        super(sfccCartridge.getPrintableName());

        this.sfccCartridge = sfccCartridge;

        this.contextValue = sfccCartridge.isPinned() ? 'sfccPinnedCartridgeTreeItem' : 'sfccCartridgeTreeItem';
        this.iconPath = path.join(__filename, '..', '..', 'static', 'icons', 'dark', this.sfccCartridge.getIcon());
    }

    public getName() {
        return this.sfccCartridge.getName();
    }
}