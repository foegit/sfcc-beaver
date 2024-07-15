import { ThemeIcon, TreeItem } from 'vscode';
import { getPinnedIcon } from '../../helpers/iconHelpers';
import SFCCCartridge from '../../classes/SFCCCartridge';

function getIcon(sfccCartridge: SFCCCartridge) {
    if (sfccCartridge.isPinned()) {
        return getPinnedIcon();
    }

    return new ThemeIcon(sfccCartridge.getIcon());
}

export default class CartridgeTreeItem extends TreeItem {
    private sfccCartridge: SFCCCartridge;

    constructor(sfccCartridge: SFCCCartridge) {
        super(sfccCartridge.getName());

        this.sfccCartridge = sfccCartridge;
        this.contextValue = sfccCartridge.isPinned() ? 'sfccPinnedCartridgeTreeItem' : 'sfccCartridgeTreeItem';
        this.iconPath = getIcon(this.sfccCartridge);
    }

    public getName() {
        return this.sfccCartridge.getName();
    }
}
