import { getSetting } from '../helpers/settings';

class TypeConfig {
  constructor(
    public priority: number,
    public emoji: string,
    public icon: string = 'cloud',
  ) {}
}
export default class SFCCCartridge {
  private path: string;
  private name: string = '';
  private type: string = '';
  private typeConfig: TypeConfig;

  constructor(path: string) {
    this.path = path;
    this.type = this.getType();
    this.typeConfig = SFCCCartridge.typePriority.get(this.type) || new TypeConfig(0, '⚪️');
  }

  getCartridgePath(): string {
    return this.path;
  }

  getName(): string {
    if (!this.name) {
      const parsedPath = this.path.match(/^.*[\/\\](.*)$/);

      this.name = parsedPath ? parsedPath[1] : 'unknown';
    }

    return this.name;
  }

  static typePriority: Map<string, TypeConfig> = new Map([
    ['pinned', new TypeConfig(100000, '⭐', 'pinned')],
    ['app', new TypeConfig(10000, '🚀')],
    ['int', new TypeConfig(1000, '🟢')],
    ['link', new TypeConfig(1000, '🟢')],
    ['plugin', new TypeConfig(1000, '🟢')],
    ['bc', new TypeConfig(100, '🔵')],
    ['bm', new TypeConfig(100, '🔵')],
    ['core', new TypeConfig(-1000, '🟣')],
    ['sfraBase', new TypeConfig(-2000, '🌩️')],
  ]);

  static sfraBaseCartridges: string[] = ['app_storefront_base', 'modules', 'bm_app_storefront_base'];

  private getType(): string {
    const cartridgeName = this.getName();
    const pinnedCartridges = getSetting('cartridges.pinnedCartridges');

    if (pinnedCartridges.includes(cartridgeName)) {
      return 'pinned';
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
    return this.getName();
  }

  public getHooks() {}

  static parseOriginalName(printableCartridgeName: string): string {
    return printableCartridgeName;
  }

  static sortByPriority(sfccCartridges: SFCCCartridge[]): SFCCCartridge[] {
    sfccCartridges.sort((c1, c2) => {
      const priorityDiff = c2.getPriority() - c1.getPriority();

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return c2.getName() > c1.getName() ? -1 : 1;
    });

    return sfccCartridges;
  }

  public isPinned() {
    return this.type === 'pinned';
  }

  public isSearchExcluded() {
    return getSetting('cartridges.searchExcludedCartridges').includes(this.getName());
  }

  public getIcon() {
    return this.typeConfig.icon;
  }
}
