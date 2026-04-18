// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { glob } from 'fast-glob';
import path = require('path');

import BeaverError, { ErrCodes } from './classes/errors/BeaverError';
import { CartridgesObserver } from './features/cartridgesView/CartridgeObserver';

import HoverManager from './classes/hover/HoverManager';
import WebviewMgr from './webviewProviders/WebviewMgr';
import CommandMgr from './commands/CommandMgr';
import CartridgeTreeItem from './features/cartridgesView/CartridgeTreeItem';
import { addToSettingList, getSetting, isSettingOff, removeFromSettingList, updateSetting } from './helpers/settings';
import { CommandRegistry } from './app/CommandRegistry';
import { WorkspaceStorage } from './app/WorkspaceStorage';
import HookModule from './features/hooks/HookModule';
import { WatcherRegistry } from './app/WatcherRegistry';

export class App {
  public context!: vscode.ExtensionContext;
  public commandRegistry!: CommandRegistry;
  public workspaceStorage!: WorkspaceStorage;
  public watcherRegistry!: WatcherRegistry;

  public hookModule?: HookModule;

  private searchExcludeStatusBar!: vscode.StatusBarItem;

  constructor() {
    console.debug('Extension created at: ', Date.now().toLocaleString());
    // app will be init in activate methods
  }

  public async activate(context: vscode.ExtensionContext) {
    console.debug('Extension activated at: ', Date.now().toLocaleString());

    this.context = context;

    this.commandRegistry = new CommandRegistry(context);
    this.workspaceStorage = new WorkspaceStorage(context);
    this.watcherRegistry = new WatcherRegistry(context);

    this.searchExcludeStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    this.searchExcludeStatusBar.command = 'cartridgesObserver.focus';
    context.subscriptions.push(this.searchExcludeStatusBar);

    const cartridgesObserver = new CartridgesObserver();

    this.hookModule = new HookModule(this);

    vscode.window.registerTreeDataProvider('cartridgesObserver', cartridgesObserver);

    vscode.commands.registerCommand('sfccBeaver.refreshCartridgeList', async () => {
      await this.indexCartridges();
      cartridgesObserver.refresh();
    });

    vscode.commands.registerCommand('sfccBeaver.pinCartridge', async (cartridgeItem: CartridgeTreeItem) => {
      await addToSettingList('cartridges.pinnedCartridges', cartridgeItem.getName());
      await this.indexCartridges();
      cartridgesObserver.refresh();
    });

    vscode.commands.registerCommand('sfccBeaver.unpinCartridge', async (cartridgeItem: CartridgeTreeItem) => {
      await removeFromSettingList('cartridges.pinnedCartridges', cartridgeItem.getName());
      await this.indexCartridges();
      cartridgesObserver.refresh();
    });

    vscode.commands.registerCommand(
      'sfccBeaver.excludeCartridgeFromSearch',
      async (cartridgeItem: CartridgeTreeItem) => {
        await addToSettingList('cartridges.searchExcludedCartridges', cartridgeItem.getName());
        await this.syncSearchExclude();
        cartridgesObserver.refresh();
      },
    );

    vscode.commands.registerCommand('sfccBeaver.includeCartridgeInSearch', async (cartridgeItem: CartridgeTreeItem) => {
      await removeFromSettingList('cartridges.searchExcludedCartridges', cartridgeItem.getName());
      await this.syncSearchExclude();
      cartridgesObserver.refresh();
    });

    vscode.commands.registerCommand('sfccBeaver.excludeAllCartridgesFromSearch', async () => {
      const cartridgeList = this.workspaceStorage.get('cartridgeList');
      const allNames = cartridgeList.map((p) => p.replace(/\\/g, '/').split('/').pop()!);
      await updateSetting('cartridges.searchExcludedCartridges', allNames);
      await this.syncSearchExclude();
      cartridgesObserver.refresh();
    });

    vscode.commands.registerCommand('sfccBeaver.includeAllCartridgesInSearch', async () => {
      await updateSetting('cartridges.searchExcludedCartridges', []);
      await this.syncSearchExclude();
      cartridgesObserver.refresh();
    });

    CommandMgr.init(context);
    HoverManager.init(context);
    WebviewMgr.init(context);

    await this.indexCartridges();

    const initialExcluded = getSetting('cartridges.searchExcludedCartridges');
    vscode.commands.executeCommand('setContext', 'sfccBeaver.hasSearchExcludedCartridges', initialExcluded.length > 0);
    this.updateSearchExcludeStatusBar(initialExcluded);

    if (initialExcluded.length > 0) {
      await this.syncSearchExclude();
    }

    if (isSettingOff('general.isSFCCProject')) {
      // Saving a setting so the tree view will be loaded immediately the next time instead of waiting for activation to be finished
      await updateSetting('general.isSFCCProject', true);

      // Update setting does not trigger recheck of when clause for tree views, so additional. It only happens on the first load
      vscode.commands.executeCommand('setContext', 'sfccBeaver.extActivated', true);
    }

    console.debug('Workspace storage: ', this.context.workspaceState.keys());
  }

  public async indexCartridges(): Promise<void> {
    if (!vscode.workspace.workspaceFolders) {
      throw new BeaverError(ErrCodes.noActiveEditor);
    }

    const [workspaceFolder] = vscode.workspace.workspaceFolders;

    const projectFiles = await glob('**/.project', {
      cwd: workspaceFolder.uri.fsPath,
      ignore: ['**/node_modules/**', '**/cartridge/**', '**/test/mocks/**'],
    });

    const cartridges = projectFiles.map((filepath) => {
      const projectFileFullPath = path.resolve(workspaceFolder.uri.fsPath, filepath);
      const cartridgePath = projectFileFullPath.replace(/[\/\\]\.project/, '');

      return cartridgePath;
    });

    this.workspaceStorage.set('cartridgeList', cartridges);
  }

  public async syncSearchExclude(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return;
    }

    const excludedNames = getSetting('cartridges.searchExcludedCartridges');
    const cartridgeList = this.workspaceStorage.get('cartridgeList');

    const searchConfig = vscode.workspace.getConfiguration('search', workspaceFolder.uri);
    const inspected = searchConfig.inspect<Record<string, boolean>>('exclude');
    const currentExclude: Record<string, boolean> = { ...(inspected?.workspaceValue || {}) };

    // Build set of all known cartridge glob patterns so we only touch our own entries
    const allCartridgeGlobs = new Set(
      cartridgeList.map((p) => path.relative(workspaceFolder.uri.fsPath, p).replace(/\\/g, '/') + '/**'),
    );

    // Remove any previously managed cartridge entries
    for (const key of Object.keys(currentExclude)) {
      if (allCartridgeGlobs.has(key)) {
        delete currentExclude[key];
      }
    }

    // Re-add only excluded ones
    for (const cartridgeName of excludedNames) {
      const cartridgePath = cartridgeList.find(
        (p) => p.endsWith('/' + cartridgeName) || p.endsWith('\\' + cartridgeName),
      );
      if (cartridgePath) {
        const relativePath = path.relative(workspaceFolder.uri.fsPath, cartridgePath).replace(/\\/g, '/');
        currentExclude[relativePath + '/**'] = true;
      }
    }

    await searchConfig.update('exclude', currentExclude, false);
    vscode.commands.executeCommand('setContext', 'sfccBeaver.hasSearchExcludedCartridges', excludedNames.length > 0);
    this.updateSearchExcludeStatusBar(excludedNames);
  }

  private updateSearchExcludeStatusBar(excludedNames: string[]): void {
    if (excludedNames.length > 0 && getSetting('cartridges.showSearchExcludeWarning')) {
      this.searchExcludeStatusBar.text = `$(eye-closed) ${excludedNames.length} cartridge${excludedNames.length > 1 ? 's' : ''} excluded`;

      const namesToShow =
        excludedNames.length > 5
          ? excludedNames.slice(0, 5).concat(`... and ${excludedNames.length - 5} more`)
          : excludedNames;

      this.searchExcludeStatusBar.tooltip = new vscode.MarkdownString(
        `**Search excluded cartridges:**\n\n${namesToShow.map((n) => `- ${n}`).join('\n')}\n\nClick to open Cartridges panel\n\n*This warning can be disabled in Settings → SFCC Beaver*`,
      );

      this.searchExcludeStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
      this.searchExcludeStatusBar.show();
    } else {
      this.searchExcludeStatusBar.hide();
    }
  }

  public async getCartridgeList(reIndex: boolean = true): Promise<string[]> {
    if (reIndex) {
      this.indexCartridges();
    }

    // return this.getMemo('cartridgeList');
    return this.workspaceStorage.get('cartridgeList')!;
  }
}

export default new App();
