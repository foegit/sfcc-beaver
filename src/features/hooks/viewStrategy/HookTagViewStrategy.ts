import { TreeItem } from 'vscode';
import { HookDetailsTreeItem } from '../treeItems/HookDetailsTreeItem';
import { HookObserver } from '../HookObserver';
import { sortHooks } from '../hooksHelpers';
import HookTagTreeItem from '../treeItems/HookTagTreeItem';
import { getSetting } from '../../../helpers/settings';
import HookLabelTreeItem from '../treeItems/HookLabelTreeItem';
import { sortTags } from '../hooksTagHelpers';
import AbstractViewStrategy from './AbstractViewStrategy';

export default class HookDisplayHybridStrategy extends AbstractViewStrategy {
  async getDynamicChildren(hookObserver: HookObserver, element: TreeItem): Promise<TreeItem[]> {
    if (element && element instanceof HookTagTreeItem) {
      const sortedHookPoint = sortHooks(element.getHookPoints());

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
      const tag = nameSplit.length > 2 ? nameSplit.slice(0, 2) : nameSplit.slice(0, 1);
      const hookDefaultTag = tag.join('.');

      if (pinnedHooks.includes(hookPoint.name)) {
        hookTagItems.pinned.addHookPoint(hookPoint);
      }

      if (!hookTagItems[hookDefaultTag]) {
        hookTagItems[hookDefaultTag] = new HookTagTreeItem(hookDefaultTag, []);
      }

      hookTagItems[hookDefaultTag].addHookPoint(hookPoint);
    });

    const tagItems = Object.keys(hookTagItems)
      .filter((key) => !hookTagItems[key].isEmpty())
      .map((tagName) => hookTagItems[tagName]);

    return sortTags(tagItems);
  }
}
