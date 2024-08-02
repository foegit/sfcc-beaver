import * as fg from 'fast-glob';
import * as path from 'path';
import { HookDetailsTreeItem } from './treeItems/HookDetailsTreeItem';
import { HookPoint, normalizeScriptPath, SFCCHookDefinition } from './hooksHelpers';
import { commands, Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import FsTool from '../../classes/tools/FsTool';
import { registerHookCommands } from './hooksCommands';
import { registerHookWatcher } from './hooksWatcher';
import { showError } from '../../helpers/notification';
import { compareSetting, getSetting } from '../../helpers/settings';
import EditorTool from '../../classes/tools/EditorTool';
import IHookViewStrategy from './viewStrategy/IHookViewStrategy';
import HookListViewStrategy from './viewStrategy/HookListViewStrategy';
import HookTagViewStrategy from './viewStrategy/HookTagViewStrategy';
import HookLabelTreeItem from './treeItems/HookLabelTreeItem';
import HookSearchViewStrategy from './viewStrategy/HookSearchViewStrategy';
import { App } from '../../App';

export class HookObserver implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<TreeItem | undefined | void> = new EventEmitter<
    TreeItem | undefined | void
  >();
  readonly onDidChangeTreeData: Event<TreeItem | undefined | void> = this._onDidChangeTreeData.event;

  private displayStrategy: IHookViewStrategy;
  private filterQuery?: string;
  private hookPoints: HookPoint[] = [];
  private sortBy: string = 'default';
  public lastClickedDetailsTreeItem: HookDetailsTreeItem | HookLabelTreeItem | null = null;

  constructor(private app: App) {
    this.filterQuery = app.getMemo('sfccBeaver.hooks.memo.lastFilter');
    this.displayStrategy = this.getHookViewStrategy();

    registerHookCommands(this);
    registerHookWatcher(this);

    this.loadHookPoints();
  }

  private getHookViewStrategy(): IHookViewStrategy {
    if (this.isSearchApplied()) {
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

  async loadHookPoints() {
    const workspaceFolder = FsTool.getCurrentWorkspaceFolder();

    const packageJsonFiles = await fg('**/package.json', {
      cwd: workspaceFolder.uri.fsPath,
      ignore: ['**/node_modules/**', '**/test/mocks/**', './package.json'],
    });

    const hookMap = new Map<string, HookPoint>();
    const pinnedHooks = getSetting('hooks.pinnedHooks');

    packageJsonFiles.forEach((filePath) => {
      const content = FsTool.parseCurrentProjectJsonFile(filePath);

      if (!content || !content.hooks) {
        return;
      }

      const cartridgeRoot = filePath.replace('package.json', '');
      const hooksFilePath = path.join(cartridgeRoot, content.hooks);
      const hooksFileRootFolder = hooksFilePath.replace('hooks.json', '');

      const parsedHookJson: { hooks: SFCCHookDefinition[] | null } = FsTool.parseCurrentProjectJsonFile(hooksFilePath);

      if (!parsedHookJson || !parsedHookJson.hooks) {
        const disabledKey = 'sfccBeaver.hooks.ignoredErrors';
        const ignoredErrors = (this.app.getMemo('sfccBeaver.hooks.ignoredErrors') as string[]) || [];

        if (ignoredErrors.includes(hooksFilePath)) {
          return;
        }

        showError(`Cannot parse hooks configuration ${hooksFilePath}`, [
          {
            title: 'Go to file',
            cb: () => {
              EditorTool.focusOnWorkspaceFile(filePath, {
                focusOnText: new RegExp('hooks'),
              });
            },
          },
          {
            title: 'Ignore',
            cb: () => {
              this.app.memo(disabledKey, [...ignoredErrors, hooksFilePath]);
            },
          },
        ]);
        return;
      }

      parsedHookJson.hooks.map((sfccHook) => {
        if (!hookMap.has(sfccHook.name)) {
          hookMap.set(sfccHook.name, {
            name: sfccHook.name,
            implementation: [],
            pinned: pinnedHooks.includes(sfccHook.name),
          });
        }

        const scriptFilePath = path.join(hooksFileRootFolder, normalizeScriptPath(sfccHook.script));

        hookMap.get(sfccHook.name)!.implementation.push({
          location: scriptFilePath,
          connected: FsTool.fileExist(scriptFilePath),
          definitionFileLocation: hooksFilePath,
          hookName: sfccHook.name,
        });
      });
    });

    this.hookPoints = Array.from(hookMap, ([hookName, hookPoint]) => hookPoint);
  }

  getTreeItem(element: TreeItem): TreeItem {
    return element;
  }

  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    return this.displayStrategy.getChildren(this, element);
  }

  getHookPoints() {
    return this.hookPoints!;
  }

  getSortBy() {
    return this.sortBy;
  }

  filter(query: string) {
    this.filterQuery = query;
    this.refresh();
    commands.executeCommand('hooksObserver.focus');

    this.app.memo('sfccBeaver.hooks.memo.lastFilter', query);
  }

  getFilterQuery() {
    return this.filterQuery;
  }

  isSearchApplied() {
    return !!this.filterQuery;
  }
}
