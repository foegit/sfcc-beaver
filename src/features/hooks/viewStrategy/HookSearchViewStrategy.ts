import { TreeItem } from 'vscode';
import { HookDetailsTreeItem } from '../treeItems/HookDetailsTreeItem';
import { HookObserver } from '../HookObserver';
import { HookPoint } from '../hooksHelpers';
import HookLabelTreeItem from '../treeItems/HookLabelTreeItem';
import AbstractViewStrategy from './AbstractViewStrategy';
import { CommonTreenItem } from '../treeItems/CommonTreeItem';

export default class HookSearchViewStrategy extends AbstractViewStrategy {
  async getDynamicChildren(hookObserver: HookObserver, element: TreeItem): Promise<TreeItem[]> {
    if (element && element instanceof HookLabelTreeItem) {
      return element.hookPoint.implementation.map((hookImp) => new HookDetailsTreeItem(hookImp));
    }
    const filterQuery = hookObserver.getFilterQuery() || '';
    const hookPoints = hookObserver.getHookPoints();

    const matchedHooks = this.filterByQuery(hookPoints, filterQuery);

    if (matchedHooks.length === 0) {
      return [
        new CommonTreenItem({
          title: `No hooks found for "${filterQuery}" query`,
          description: 'Click to change',
          commandOnClickName: 'sfccBeaver.hooks.filter',
        }),
      ];
    }

    return matchedHooks.map((hookPoint) => new HookLabelTreeItem(hookPoint));
  }

  filterByQuery(hookPoints: HookPoint[], filterQuery: string): HookPoint[] {
    const filtered = hookPoints.filter((hookPoint) => {
      if (hookPoint.name.includes(filterQuery)) {
        return true;
      }

      return false;
    });

    return filtered;
  }
}
