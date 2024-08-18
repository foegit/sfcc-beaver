// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fg from 'fast-glob';
import path = require('path');

import BeaverError, { ErrCodes } from './classes/errors/BeaverError';
import { CartridgesObserver } from './features/cartridgesView/CartridgeObserver';

import HoverManager from './classes/hover/HoverManager';
import WebviewMgr from './webviewProviders/WebviewMgr';
import CommandMgr from './commands/CommandMgr';
import CartridgeTreeItem from './features/cartridgesView/CartridgeTreeItem';
import { addToSettingList, isSettingOff, removeFromSettingList, updateSetting } from './helpers/settings';
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

    CommandMgr.init(context);
    HoverManager.init(context);
    WebviewMgr.init(context);

    this.indexCartridges();

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

    const projectFiles = await fg('**/.project', {
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

  public async getCartridgeList(reIndex: boolean = true): Promise<string[]> {
    if (reIndex) {
      this.indexCartridges();
    }

    // return this.getMemo('cartridgeList');
    return this.workspaceStorage.get('cartridgeList')!;
  }
}

export default new App();
