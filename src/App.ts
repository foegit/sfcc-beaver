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
import { HookObserver } from './features/hooksView/HookObserver';
import CartridgeTreeItem from './features/cartridgesView/CartridgeTreeItem';
import { addToSettingList, isSettingOff, removeFromSettingList, updateSetting } from './helpers/settings';

class App {
  public workspaceState?: vscode.Memento;

  constructor() {
    console.debug('Extension activated at: ', String(Date.now()) + Math.random());
  }

  public async activate(context: vscode.ExtensionContext) {
    const cartridgesObserver = new CartridgesObserver();
    const hooksObserver = new HookObserver();

    vscode.window.registerTreeDataProvider('cartridgesObserver', cartridgesObserver);

    vscode.window.registerTreeDataProvider('hooksObserver', hooksObserver);

    vscode.commands.registerCommand('sfccBeaver.refreshCartridgeList', async () => {
      await this.indexCartridges();
      cartridgesObserver.refresh();
    });

    vscode.commands.registerCommand('sfccBeaver.pinCartridge', async (cartridgeItem: CartridgeTreeItem) => {
      await addToSettingList('hooks.pinnedHooks', cartridgeItem.getName());
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

    this.workspaceState = context.workspaceState;
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
    this.workspaceState && this.workspaceState.update(key, value);
  }

  public getMemo(key: string): any {
    return this.workspaceState?.get(key);
  }

  public async getCartridgeList(reIndex: boolean = true): Promise<string[]> {
    if (reIndex) {
      this.indexCartridges();
    }

    return this.getMemo('cartridgeList');
  }
}

export default new App();
