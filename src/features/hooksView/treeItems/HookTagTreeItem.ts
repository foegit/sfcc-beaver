import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { HookPoint } from '../hooksHelpers';
import { colors } from '../../../helpers/iconHelpers';

export default class HookTagTreeItem extends TreeItem {
  public name: string;
  public hookPoints: HookPoint[];
  public isPinned: boolean = false;

  constructor(name: string, hookPoints: HookPoint[], isPinned: boolean = false) {
    super(name, isPinned ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.Collapsed);

    this.name = name;
    this.hookPoints = hookPoints;
    this.isPinned = isPinned;

    // this.description = getDescription(hookPoint);
    this.iconPath = this.getIconPath();
    // this.contextValue = hookPoint.pinned ? 'hookLabelTreeItemPinned' : 'hookLabelTreeItem';
  }

  getIconPath() {
    if (this.isPinned) {
      return new ThemeIcon('tag', colors.yellow);
    }

    return new ThemeIcon('tag');
  }
}
