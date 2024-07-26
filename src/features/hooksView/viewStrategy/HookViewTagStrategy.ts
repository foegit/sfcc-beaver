import { TreeItem } from 'vscode';
import IHookViewStrategy from './IHookViewStrategy';
import { HookDetailsTreeItem } from '../treeItems/HookDetailsTreeItem';
import { HookObserver } from '../HookObserver';
import { sortHooks } from '../hooksHelpers';
import HookTagTreeItem from '../treeItems/HookTagTreeItem';
import { getSetting } from '../../../helpers/settings';
import HookLabelTreeItem from '../treeItems/HookLabelTreeItem';

export default class HookDisplayHybridStrategy implements IHookViewStrategy {
  async getChildren(hookObserver: HookObserver, element: TreeItem): Promise<TreeItem[]> {
    if (element && element instanceof HookTagTreeItem) {
      const sortedHookPoint = sortHooks(element.hookPoints);

      return sortedHookPoint.map((hookPoint) => new HookLabelTreeItem(hookPoint));
    }

    if (element && element instanceof HookLabelTreeItem) {
      return element.hookPoint.implementation.map((hookImp) => new HookDetailsTreeItem(hookImp));
    }

    const hookTagItems: { [key: string]: HookTagTreeItem } = {
      pinned: new HookTagTreeItem('#pinned', [], true),
    };

    const pinnedHooks = getSetting('hooks.pinnedHooks');

    if (hookObserver.getHookPoints().length === 0) {
      await hookObserver.loadHookPoints();
    }

    hookObserver.getHookPoints().forEach((hookPoint) => {
      const nameSplit = hookPoint.name.split('.');
      const hookDefaultTag = nameSplit[0];

      if (pinnedHooks.includes(hookPoint.name)) {
        hookTagItems.pinned.hookPoints.push(hookPoint);
      }

      if (!hookTagItems[hookDefaultTag]) {
        hookTagItems[hookDefaultTag] = new HookTagTreeItem(hookDefaultTag, []);
      }

      hookTagItems[hookDefaultTag].hookPoints.push(hookPoint);
    });

    return Object.keys(hookTagItems)
      .filter((key) => hookTagItems[key].hookPoints.length !== 0)
      .sort((k1, k2) => k1.localeCompare(k2))
      .map((tagName) => hookTagItems[tagName]);
  }
}
