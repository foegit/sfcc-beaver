import { TreeItem } from 'vscode';
import SFCCCartridge from '../SFCCCartridge';

export default class DamTree extends TreeItem {
    private sfccCartridge: SFCCCartridge;

    constructor(sfccCartridge: SFCCCartridge) {
        super(sfccCartridge.getPrintableName());
        this.sfccCartridge = sfccCartridge;
    }
}