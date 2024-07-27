import { TreeItem } from 'vscode';
import IHookViewStrategy from './IHookViewStrategy';
import { HookDetailsTreeItem } from '../treeItems/HookDetailsTreeItem';
import { HookObserver } from '../HookObserver';
import { sortHooks } from '../hooksHelpers';
import HookLabelTreeItem from '../treeItems/HookLabelTreeItem';

export default class HookListViewStrategy implements IHookViewStrategy {
  async getChildren(hookObserver: HookObserver, element: TreeItem): Promise<TreeItem[]> {
    if (element && element instanceof HookLabelTreeItem) {
      return element.hookPoint.implementation.map((hookImp) => new HookDetailsTreeItem(hookImp));
    }

    if (hookObserver.getHookPoints().length === 0) {
      await hookObserver.loadHookPoints();
    }

    const sortedHookPoints = sortHooks(hookObserver.getHookPoints(), hookObserver.getSortBy());

    return sortedHookPoints.map((hookPoint) => new HookLabelTreeItem(hookPoint));
  }
}
