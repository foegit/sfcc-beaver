import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { getHookType, HookPoint, HookTypes } from './../hooksHelpers';
import { colors, getPinnedIcon } from '../../../helpers/iconHelpers';
import { TreeNodeType } from '../viewStrategy/HookViewFullTreeStrategy';

export default class HookPathLabelTreeItems extends TreeItem {
  constructor(private node: TreeNodeType, name: string) {
    super(name, TreeItemCollapsibleState.Collapsed);

    // this.description = getDescription(hookPoint);
    // this.iconPath = getIcon(hookPoint);
    // this.contextValue = hookPoint.pinned ? 'hookLabelTreeItemPinned' : 'hookLabelTreeItem';
  }

  getNode() {
    return this.node;
  }
}
