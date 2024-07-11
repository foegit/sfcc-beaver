import { ThemeColor, ThemeIcon, TreeItem } from 'vscode';
import SFCCCartridge from '../../SFCCCartridge';
import { getPinnedIcon } from '../../../helpers/iconHelpers';

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
