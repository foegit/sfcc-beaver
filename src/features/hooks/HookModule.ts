import { App } from '../../App';
import AbstractModule from '../../classes/app/AbstractModule';
import FsTool from '../../classes/tools/FsTool';
import { glob } from 'fast-glob';
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

    const packageJsonFiles = await glob('**/package.json', {
      cwd: workspaceFolder.uri.fsPath,
      ignore: ['**/node_modules/**', '**/test/mocks/**', './package.json'],
    });

    const hookMap = new Map<string, HookPoint>();
    const pinnedHooks = getSetting('hooks.pinnedHooks');
    const disabledKey = 'sfccBeaver.hooks.ignoredErrors';
    const ignoredErrors = this.workspaceStorage.get(disabledKey);
    const errorsToShow: { hooksFilePath: string; packageJsonPath: string }[] = [];

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
        if (!ignoredErrors.includes(hooksFilePath)) {
          errorsToShow.push({ hooksFilePath, packageJsonPath: filePath });
        }

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

    if (errorsToShow.length) {
      const notification =
        errorsToShow.length === 1
          ? `Cannot parse hooks configuration ${errorsToShow[0].hooksFilePath}`
          : `Cannot parse hooks configuration for the following files:\n${errorsToShow
              .map((error) => `- ${error.hooksFilePath}`)
              .join('\n')}`;

      showError(notification, [
        {
          title: 'Go to file',
          cb: () => {
            EditorTool.focusOnWorkspaceFile(errorsToShow[0].packageJsonPath, {
              focusOnText: new RegExp('hooks'),
            });
          },
        },
        {
          title: 'Ignore',
          cb: () => {
            const allIgnored = Array.from(
              new Set([...ignoredErrors, ...errorsToShow.map((error) => error.hooksFilePath)]),
            );

            this.workspaceStorage.set(disabledKey, allIgnored);
          },
        },
      ]);
    }

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
