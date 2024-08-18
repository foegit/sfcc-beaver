import { TreeItem } from 'vscode';
import { HookDetailsTreeItem } from '../treeItems/HookDetailsTreeItem';
import { sortHooks } from '../hooksHelpers';
import HookLabelTreeItem from '../treeItems/HookLabelTreeItem';
import AbstractViewStrategy from './AbstractViewStrategy';
import HookModule from '../HookModule';

export default class HookListViewStrategy extends AbstractViewStrategy {
  async getDynamicChildren(hookModule: HookModule, element: TreeItem): Promise<TreeItem[]> {
    if (element && element instanceof HookLabelTreeItem) {
      return element.hookPoint.implementation.map((hookImp) => new HookDetailsTreeItem(hookImp));
    }

    const sortedHookPoints = sortHooks(await hookModule.getHookPoints());

    return sortedHookPoints.map((hookPoint) => new HookLabelTreeItem(hookPoint));
  }
}
