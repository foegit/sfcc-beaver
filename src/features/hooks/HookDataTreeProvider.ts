import { HookDetailsTreeItem } from './treeItems/HookDetailsTreeItem';
import { HookPoint } from './hooksHelpers';
import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { compareSetting } from '../../helpers/settings';
import IHookViewStrategy from './viewStrategy/IHookViewStrategy';
import HookListViewStrategy from './viewStrategy/HookListViewStrategy';
import HookTagViewStrategy from './viewStrategy/HookTagViewStrategy';
import HookLabelTreeItem from './treeItems/HookLabelTreeItem';
import HookSearchViewStrategy from './viewStrategy/HookSearchViewStrategy';
import HookModule from './HookModule';

export class HookDataTreeProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<TreeItem | undefined | void> = new EventEmitter<
    TreeItem | undefined | void
  >();
  readonly onDidChangeTreeData: Event<TreeItem | undefined | void> = this._onDidChangeTreeData.event;

  private displayStrategy: IHookViewStrategy;
  private hookPoints: HookPoint[] = [];
  private sortBy: string = 'default';
  public lastClickedDetailsTreeItem: HookDetailsTreeItem | HookLabelTreeItem | null = null;

  constructor(private hookModule: HookModule) {
    this.displayStrategy = this.getHookViewStrategy();
  }

  private getHookViewStrategy(): IHookViewStrategy {
    if (this.hookModule.isFilterApplied()) {
      return new HookSearchViewStrategy();
    }

    if (compareSetting('hooks.viewMode', 'tag')) {
      return new HookTagViewStrategy();
    }

    return new HookListViewStrategy();
  }

  refresh(): void {
    this.displayStrategy = this.getHookViewStrategy();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeItem): TreeItem {
    return element;
  }

  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    return this.displayStrategy.getChildren(this.hookModule, element);
  }

  getHookPoints() {
    return this.hookPoints!;
  }

  getSortBy() {
    return this.sortBy;
  }
}
