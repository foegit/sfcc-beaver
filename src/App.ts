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
import { HookObserver } from './features/hooks/HookObserver';
import CartridgeTreeItem from './features/cartridgesView/CartridgeTreeItem';
import { addToSettingList, isSettingOff, removeFromSettingList, updateSetting } from './helpers/settings';
import { CommandRegistry } from './app/CommandRegistry';

export class App {
  public context!: vscode.ExtensionContext;
  public commandRegistry!: CommandRegistry;

  constructor() {
    console.debug('Extension created at: ', Date.now().toLocaleString());
    // app will be init in activate methods
  }

  public async activate(context: vscode.ExtensionContext) {
    console.debug('Extension activated at: ', Date.now().toLocaleString());

    this.context = context;
    this.commandRegistry = new CommandRegistry(context);

    const cartridgesObserver = new CartridgesObserver();
    const hooksObserver = new HookObserver(this);

    vscode.window.registerTreeDataProvider('cartridgesObserver', cartridgesObserver);
    vscode.window.registerTreeDataProvider('hooksObserver', hooksObserver);

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

    this.memo('cartridgeList', cartridges);
  }

  public memo(key: string, value: any) {
    this.context.workspaceState.update(key, value);
  }

  public getMemo(key: string): any {
    return this.context.workspaceState.get(key);
  }

  public async getCartridgeList(reIndex: boolean = true): Promise<string[]> {
    if (reIndex) {
      this.indexCartridges();
    }

    return this.getMemo('cartridgeList');
  }
}

export default new App();
