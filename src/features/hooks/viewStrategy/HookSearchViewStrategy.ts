import { TreeItem } from 'vscode';
import { HookDetailsTreeItem } from '../treeItems/HookDetailsTreeItem';
import { HookPoint } from '../hooksHelpers';
import HookLabelTreeItem from '../treeItems/HookLabelTreeItem';
import AbstractViewStrategy from './AbstractViewStrategy';
import HookModule from '../HookModule';

export default class HookSearchViewStrategy extends AbstractViewStrategy {
  async getDynamicChildren(hookModule: HookModule, element: TreeItem): Promise<TreeItem[]> {
    if (element && element instanceof HookLabelTreeItem) {
      return element.hookPoint.implementation.map((hookImp) => new HookDetailsTreeItem(hookImp));
    }
    const filterQuery = hookModule.getFilterQuery() || '';
    const hookPoints = await hookModule.getHookPoints();

    const matchedHooks = this.filterByQuery(hookPoints, filterQuery);

    if (matchedHooks.length === 0) {
      return [
        {
          label: `No hooks found for "${filterQuery}" query`,
          description: 'Click to change',
          command: {
            command: 'sfccBeaver.hooks.filter',
            title: 'Enter filter',
          },
        },
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
