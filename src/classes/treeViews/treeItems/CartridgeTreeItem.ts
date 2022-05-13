import { ThemeIcon, TreeItem } from 'vscode';
import SFCCCartridge from '../../SFCCCartridge';
export default class CartridgeTreeItem extends TreeItem {
    private sfccCartridge: SFCCCartridge;

    constructor(sfccCartridge: SFCCCartridge) {
        super(sfccCartridge.getPrintableName());

        this.sfccCartridge = sfccCartridge;
        this.contextValue = sfccCartridge.isPinned() ? 'sfccPinnedCartridgeTreeItem' : 'sfccCartridgeTreeItem';
        this.iconPath = new ThemeIcon(this.sfccCartridge.getIcon());
    }

    public getName() {
        return this.sfccCartridge.getName();
    }
}