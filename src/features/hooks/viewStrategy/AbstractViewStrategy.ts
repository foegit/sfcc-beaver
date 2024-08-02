import { ThemeIcon, TreeItem } from 'vscode';
import IHookViewStrategy from './IHookViewStrategy';
import { HookObserver } from '../HookObserver';
import { CommonTreenItem } from '../treeItems/CommonTreeItem';

export default abstract class AbstractViewStrategy implements IHookViewStrategy {
  async getChildren(hookObserver: HookObserver, element: TreeItem): Promise<TreeItem[]> {
    if (element) {
      return this.getDynamicChildren(hookObserver, element);
    }

    if (hookObserver.getHookPoints().length === 0) {
      // ensure hooks are parsed
      await hookObserver.loadHookPoints();
    }

    const filterQuery = hookObserver.getFilterQuery();
    const filterTitle = filterQuery ? `Filtered by "${filterQuery}"` : 'Filter';
    const filterDescription = filterQuery ? 'Double Click to Change' : 'Click to Enter Filter';
    const filterContextValue = filterQuery ? 'hooksFilterTreeBarApplied' : 'hooksFilterTreeBar';

    const filterBar = new CommonTreenItem({
      title: filterTitle,
      commandOnClickName: filterQuery ? 'sfccBeaver.hooks.filterDoubleClick' : 'sfccBeaver.hooks.filter',
      description: filterDescription,
      icon: new ThemeIcon('filter'),
      contextValue: filterContextValue,
    });

    return [filterBar, ...(await this.getDynamicChildren(hookObserver, element))];
  }

  abstract getDynamicChildren(hookObserver: HookObserver, element: TreeItem): Promise<TreeItem[]>;
}
