import { App } from '../../App';
import AbstractModule from '../../classes/app/AbstractModule';
import FsTool from '../../classes/tools/FsTool';
import * as fg from 'fast-glob';
import * as path from 'path';
import EditorTool from '../../classes/tools/EditorTool';
import { showError } from '../../helpers/notification';
import { getSetting } from '../../helpers/settings';
import { HookPoint, SFCCHookDefinition, normalizeScriptPath } from './hooksHelpers';
import { registerHookCommands } from './hooksCommands';
import { HookDataTreeProvider } from './HookDataTreeProvider';
import { window } from 'vscode';
import { registerHookWatcher } from './hooksWatcher';
import { parseCartridgePath } from '../cartridgesView/cartridgesHelpers';

export default class HookModule extends AbstractModule {
  private hookPoints?: HookPoint[];
  private hookDataTreeProvider: HookDataTreeProvider;
  private filterQuery: string;

  constructor(app: App) {
    super(app);

    this.hookDataTreeProvider = new HookDataTreeProvider(this);
    this.filterQuery = this.workspaceStorage.get('sfccBeaver.hooks.memo.lastFilter');

    window.registerTreeDataProvider('hooksObserver', this.hookDataTreeProvider);

    registerHookCommands(this);
    registerHookWatcher(this);
  }

  async parseHooks() {
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
        const ignoredErrors = this.workspaceStorage.get(disabledKey);

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
              this.workspaceStorage.set(disabledKey, [...ignoredErrors, hooksFilePath]);
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
        const parsedCartridgeInfo = parseCartridgePath(scriptFilePath);

        hookMap.get(sfccHook.name)!.implementation.push({
          location: scriptFilePath,
          connected: FsTool.fileExist(scriptFilePath),
          definitionFileLocation: hooksFilePath,
          hookName: sfccHook.name,
          ...parsedCartridgeInfo,
        });
      });
    });

    this.hookPoints = Array.from(hookMap, ([hookName, hookPoint]) => hookPoint);
  }

  refreshHooksView() {
    this.hookDataTreeProvider.refresh();
  }

  applyFilterQuery(filterQuery: string) {
    this.filterQuery = filterQuery;

    this.refreshHooksView();
  }

  async getHookPoints() {
    if (!this.hookPoints) {
      await this.parseHooks();
    }

    return this.hookPoints!;
  }

  getFilterQuery() {
    return this.filterQuery;
  }

  isFilterApplied() {
    return !!this.filterQuery;
  }

  getHookDataTreeProvider() {
    return this.hookDataTreeProvider;
  }
}
