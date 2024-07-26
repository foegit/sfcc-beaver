import { TreeItem } from 'vscode';
import IHookViewStrategy from './IHookViewStrategy';
import { HookObserver } from '../HookObserver';
import { HookImplementation, HookPoint, sortHooks } from '../hooksHelpers';
import HookPathLabelTreeItems from '../treeItems/HookPathLabelTreeItems';
import { HookDetailsTreeItem } from '../treeItems/HookDetailsTreeItem';

export type TreeNodeType = {
  [key: string]: TreeNodeType | HookImplementation[];
};

function writeRecursively(obj: TreeNodeType, hookPoint: HookPoint, path: string[], level: number): void {
  if (level === 1) {
    obj[path[level]] = hookPoint.implementation;
    return;
  }

  if (!obj[path[level]]) {
    obj[path[level]] = {};
  }

  writeRecursively(obj[path[level]] as TreeNodeType, hookPoint, path, level + 1);
}

export default class HookDisplayTreeStrategy implements IHookViewStrategy {
  flattenChildren(node: TreeNodeType) {
    const result: TreeItem[] = [];

    Object.keys(node).forEach((key) => {
      if (Array.isArray(node[key])) {
        node[key].forEach((hookImp) => {
          result.push(new HookDetailsTreeItem(hookImp));
        });

        return;
      }

      result.push(new HookPathLabelTreeItems(node[key], key));
    });

    return result;
  }

  async getChildren(hookObserver: HookObserver, element?: TreeItem): Promise<TreeItem[]> {
    if (element instanceof HookPathLabelTreeItems) {
      return this.flattenChildren(element.getNode());
    }

    if (hookObserver.getHookPoints().length === 0) {
      await hookObserver.loadHookPoints();
    }

    const hookMap: TreeNodeType = {};

    const hookPoints = hookObserver.getHookPoints();

    hookPoints.forEach((hookPoint) => {
      const splitHook = hookPoint.name.split('.');

      writeRecursively(hookMap, hookPoint, splitHook, 0);
    });

    return this.flattenChildren(hookMap);
  }
}
