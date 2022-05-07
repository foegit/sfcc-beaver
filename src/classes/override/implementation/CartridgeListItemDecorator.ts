import { workspace } from 'vscode';
import SFCCCartridge from '../../SFCCCartridge';
import SettingTool from '../../tools/SettingTool';

class TypeConfig {
    constructor(
        public weight : number,
        public emoji: string
    ) {}
}

export default class CartridgeListItemDecorator {
    private prefix: string;
    private prefixConfig: TypeConfig;

    constructor(private sfccCartridge: SFCCCartridge) {
        this.prefix = this.getType(sfccCartridge);
        this.prefixConfig = CartridgeListItemDecorator.typePriorityWeight.get(this.prefix) || new TypeConfig(0, '⚪️');
    }


    static typePriorityWeight: Map<string, TypeConfig> = new Map([
        ['favorite', new TypeConfig(100000, '⭐')],
        ['app', new TypeConfig(10000, '🚀')],
        ['int', new TypeConfig(1000, '🟢')],
        ['link', new TypeConfig(1000, '🟢')],
        ['plugin', new TypeConfig(1000, '🟢')],
        ['bc', new TypeConfig(100, '🔵')],
        ['bm', new TypeConfig(100, '🔵')],
        ['core', new TypeConfig(-1000, '🟣')],
        ['sfraBase', new TypeConfig(-2000, '🌩️')]
    ]);

    private getType(sfccCartridge: SFCCCartridge): string {
        const cartridgeName = sfccCartridge.getName();
        const favoriteCartridges = SettingTool.getFavoriteCartridges();

        if (favoriteCartridges.includes(cartridgeName)) {
            return 'favorite';
        }

        if (cartridgeName === 'app_storefront_base') {
            return 'sfraBase';
        }

        const prefix = /^([^_]*)_.*$/.exec(cartridgeName);

        return prefix ? prefix[1] : 'unknown';
    }

    public getPriority(): number {
        return this.prefixConfig.weight;
    }

    public getPrintableName() {
        return `${this.prefixConfig.emoji} ${this.sfccCartridge.getName()}`;
    }

    static parseOriginalName(printableCartridgeName: string): string {
        return printableCartridgeName.replace(/^.*\s/, '');
    }
}