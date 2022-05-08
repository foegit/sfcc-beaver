import { TreeItem } from 'vscode';
import SFCCCartridge from '../../SFCCCartridge';
import * as path from 'path';

export default class CartridgeTreeItem extends TreeItem {
    private sfccCartridge: SFCCCartridge;

    constructor(sfccCartridge: SFCCCartridge) {
        super(sfccCartridge.getPrintableName());
        this.contextValue = sfccCartridge.isFavorite() ? 'sfccFavCartridgeTreeItem' : 'sfccCartridgeTreeItem';
        this.sfccCartridge = sfccCartridge;
    }

    iconPath = {
        light: path.join(__filename, '../../../../static/icons/light/star-full.svg'),
        dark: path.join(__filename, '../../../../static/icons/dark/star-full.svg')
    };


    public getName() {
        return this.sfccCartridge.getName();
    }
}