import SettingTool from './tools/SettingTool';


class TypeConfig {
    constructor(
        public priority : number,
        public emoji: string
    ) {}
}
export default class SFCCCartridge {
    private path : string;
    private name : string = '';
    private type : string = '';
    private typeConfig : TypeConfig;

    constructor(path : string) {
        this.path = path;
        this.type = this.getType();
        this.typeConfig = SFCCCartridge.typePriority.get(this.type) || new TypeConfig(0, '⚪️');
    }

    getCartridgePath() : string {
        return this.path;
    }

    getName() : string {
        if (!this.name) {
            const parsedPath = this.path.match(/^.*[\/\\](.*)$/);

            this.name = parsedPath ? parsedPath[1] : 'unknown';
        }

        return this.name;
    }

    static typePriority: Map<string, TypeConfig> = new Map([
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

    static sfraBaseCartridges: string[] = ['app_storefront_base', 'modules', 'bm_app_storefront_base'];

    private getType(): string {
        const cartridgeName = this.getName();
        const favoriteCartridges = SettingTool.getFavoriteCartridges();

        if (favoriteCartridges.includes(cartridgeName)) {
            return 'favorite';
        }

        if (SFCCCartridge.sfraBaseCartridges.includes(cartridgeName)) {
            return 'sfraBase';
        }

        const prefix = /^([^_]*)_.*$/.exec(cartridgeName);

        return prefix ? prefix[1] : 'unknown';
    }

    public getPriority() {
        return this.typeConfig.priority;
    }

    public getPrintableName() {
        return `${this.typeConfig.emoji} ${this.getName()}`;
    }

    static parseOriginalName(printableCartridgeName: string): string {
        return printableCartridgeName.replace(/^.*\s/, '');
    }

    static sortByPriority(sfccCartridges: SFCCCartridge[]): SFCCCartridge[] {
        sfccCartridges.sort((c1, c2) => {
            const priorityDiff = c2.getPriority() - c1.getPriority();

            if (priorityDiff !== 0) {
                return priorityDiff;
            }

            if (c2.getName() > c1.getName()) {
                return -1;
            } else {
                return 1;
            }
        });

        return sfccCartridges;
    }

    public isFavorite(): boolean {
        return this.type === 'favorite';
    }
}