import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import {
  ERR_NOT_FOUND_HOOK_IMPLEMENTATION,
  HookPoint,
  hookPointHasDuplicates,
  hookPointHasMissingImp,
  WARN_DUPLICATED_HOOK_DEFINITION,
} from '../hooksHelpers';
import { colors } from '../../../helpers/iconHelpers';

export default class HookTagTreeItem extends TreeItem {
  public name: string;
  private hookPoints: HookPoint[];
  public isPinned: boolean = false;
  public hasMissingImp: boolean = false;
  public hasDuplicationImp: boolean = false;

  constructor(name: string, hookPoints: HookPoint[], isPinned: boolean = false) {
    super(name, isPinned ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.Collapsed);

    this.name = name;
    this.hookPoints = hookPoints;
    this.isPinned = isPinned;

    this.syncDescription();
    this.syncIcon();
  }

  private calcDescription() {
    const amount = String(this.hookPoints.length);

    if (this.hasMissingImp) {
      return `${amount} (${ERR_NOT_FOUND_HOOK_IMPLEMENTATION})`;
    }

    if (this.hasDuplicationImp) {
      return `${amount} (${WARN_DUPLICATED_HOOK_DEFINITION})`;
    }

    return String(this.hookPoints.length);
  }

  private syncDescription() {
    this.description = this.calcDescription();
  }

  private syncFlags() {
    this.hasMissingImp = this.hookPoints.some(hookPointHasMissingImp);
    this.hasDuplicationImp = this.hookPoints.some(hookPointHasDuplicates);
  }

  private calcIcon() {
    if (this.hasMissingImp) {
      return new ThemeIcon('tag', colors.red);
    }

    if (this.hasDuplicationImp) {
      return new ThemeIcon('tag', colors.orange);
    }

    if (this.isPinned) {
      return new ThemeIcon('tag', colors.yellow);
    }

    return new ThemeIcon('tag');
  }

  private syncIcon() {
    this.iconPath = this.calcIcon();
  }

  addHookPoint(hookPoint: HookPoint) {
    this.hookPoints.push(hookPoint);
    this.syncFlags();
    this.syncDescription();
    this.syncIcon();
  }

  getHookPoints() {
    return this.hookPoints;
  }

  isEmpty() {
    return this.hookPoints.length === 0;
  }
}
