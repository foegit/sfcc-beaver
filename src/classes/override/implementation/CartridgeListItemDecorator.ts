import SFCCCartridge from '../../SFCCCartridge';

class PrefixConfig {
    constructor(
        public weight : number,
        public emoji: string
    ) {}
}

export default class CartridgeListItemDecorator {
    private prefix: string;
    private prefixConfig: PrefixConfig;

    constructor(private sfccCartridge: SFCCCartridge) {
        this.prefix = this.parsePrefix(sfccCartridge);
        this.prefixConfig = CartridgeListItemDecorator.prefixPriorityWeight.get(this.prefix) || new PrefixConfig(0, '⚪️');
    }

    static standardCoreCartridges = ['modules', 'app_storefront_base'];

    static prefixPriorityWeight: Map<string, PrefixConfig> = new Map([
        ['app', new PrefixConfig(10000, '⭐️')],
        ['int', new PrefixConfig(1000, '🟢')],
        ['link', new PrefixConfig(1000, '🟢')],
        ['plugin', new PrefixConfig(1000, '🟢')],
        ['bc', new PrefixConfig(100, '🔵')],
        ['bm', new PrefixConfig(100, '🔵')],
        ['core', new PrefixConfig(-1000, '🟣')],
        ['sfraBase', new PrefixConfig(-2000, '🌩️')]
    ]);

    private parsePrefix(sfccCartridge: SFCCCartridge): string {
        const cartridgeName = sfccCartridge.getName();

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