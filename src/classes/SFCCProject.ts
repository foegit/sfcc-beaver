import path = require('path');

import SFCCCartridge from './SFCCCartridge';

import App from '../App';
export default class SFCCProject {
    cartridges : SFCCCartridge[] = [];

    constructor() {
        console.log('SFCC Project Initialized');
    }

    public async loadCartridges(reIndex: boolean = true): Promise<SFCCCartridge[]> {
        if (reIndex) {
            await App.indexCartridges();
        }

        const cartridgeList = await App.getCartridgeList();

        this.cartridges = cartridgeList.map(cartridgePath => {
            return new SFCCCartridge(cartridgePath);
        });

        return this.cartridges;
    }

    async getSortedCartridges(reIndex: boolean = true) {
        return SFCCCartridge.sortByPriority(await this.loadCartridges());
    }

    getCartridgeByName(name : string) : (SFCCCartridge|undefined) {
        this.loadCartridges();

        return this.cartridges.find(cartridge => cartridge.getName() === name);
    }
}