import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { HookPoint } from '../hooksHelpers';
import { colors } from '../../../helpers/iconHelpers';

export default class HookTagTreeItem extends TreeItem {
  public name: string;
  private hookPoints: HookPoint[];
  public isPinned: boolean = false;

  constructor(name: string, hookPoints: HookPoint[], isPinned: boolean = false) {
    super(name, isPinned ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.Collapsed);

    this.name = name;
    this.hookPoints = hookPoints;
    this.isPinned = isPinned;
    this.iconPath = this.getIconPath();
    this.description = '' + hookPoints.length;
  }

  private updateDescription() {
    this.description = String(this.hookPoints.length);
  }

  private getIconPath() {
    if (this.isPinned) {
      return new ThemeIcon('tag', colors.yellow);
    }

    return new ThemeIcon('tag');
  }

  addHookPoint(hookPoint: HookPoint) {
    this.hookPoints.push(hookPoint);
    this.updateDescription();
  }

  getHookPoints() {
    return this.hookPoints;
  }

  isEmpty() {
    return this.hookPoints.length === 0;
  }
}
