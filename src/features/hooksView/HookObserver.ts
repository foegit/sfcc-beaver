import * as fg from 'fast-glob';
import * as path from 'path';
import { HookDetailsTreeItem } from './HookDetailsTreeItem';
import HookLabelTreeItem from './HookLabelTreeItem';
import { HookPoint, normalizeScriptPath, SFCCHookDefinition, sortHooks } from './hooksHelpers';
import { Event, EventEmitter, TreeDataProvider, TreeItem, Uri, window, workspace } from 'vscode';
import FsTool from '../../classes/tools/FsTool';
import { registerHookCommands } from './hooksCommands';
import { registerHookWatcher } from './hooksWatcher';
import { showError } from '../../helpers/notification';
import { getSetting } from '../../helpers/settings';

export class HookObserver implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<TreeItem | undefined | void> = new EventEmitter<
    TreeItem | undefined | void
  >();
  readonly onDidChangeTreeData: Event<TreeItem | undefined | void> = this._onDidChangeTreeData.event;

  constructor() {
    registerHookCommands(this);
    registerHookWatcher(this);
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  private hookPoints: HookPoint[] = [];
  private sortBy: string = 'default';
  public lastClickedDetailsTreeItem: HookDetailsTreeItem | null = null;

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
        showError(`Cannot parse hooks configuration ${hooksFilePath}`);
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
        });
      });
    });

    this.hookPoints = Array.from(hookMap, ([hookName, hookPoint]) => hookPoint);
  }

  getTreeItem(element: TreeItem): TreeItem {
    return element;
  }

  async getChildren(hookLabelTreeItem?: HookLabelTreeItem): Promise<TreeItem[]> {
    if (hookLabelTreeItem) {
      return hookLabelTreeItem.hookPoint.implementation.map((hookImp) => new HookDetailsTreeItem(hookImp));
    }

    if (this.hookPoints.length === 0) {
      await this.loadHookPoints();
    }

    const sortedHookPoints = sortHooks(this.hookPoints, this.sortBy);

    return sortedHookPoints.map((hookPoint) => new HookLabelTreeItem(hookPoint));
  }
}
