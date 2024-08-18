import { ThemeIcon, TreeItem } from 'vscode';
import IHookViewStrategy from './IHookViewStrategy';
import HookModule from '../HookModule';

export default abstract class AbstractViewStrategy implements IHookViewStrategy {
  async getChildren(hookModule: HookModule, element: TreeItem): Promise<TreeItem[]> {
    if (element) {
      return this.getDynamicChildren(hookModule, element);
    }

    const filterQuery = hookModule.getFilterQuery();
    const filterTitle = filterQuery ? `Filtered by "${filterQuery}"` : 'Filter';
    const filterDescription = filterQuery ? 'Double Click to Change' : 'Click to Enter Filter';
    const filterContextValue = filterQuery ? 'hooksFilterTreeBarApplied' : 'hooksFilterTreeBar';

    const filterBar: TreeItem = {
      label: filterTitle,
      command: {
        command: filterQuery ? 'sfccBeaver.hooks.filterDoubleClick' : 'sfccBeaver.hooks.filter',
        title: filterQuery ? 'Change' : 'Enter Filter',
      },
      description: filterDescription,
      iconPath: new ThemeIcon('filter'),
      contextValue: filterContextValue,
    };

    return [filterBar, ...(await this.getDynamicChildren(hookModule, element))];
  }

  abstract getDynamicChildren(hookModule: HookModule, element: TreeItem): Promise<TreeItem[]>;
}
