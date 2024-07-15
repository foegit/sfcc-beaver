import { commands } from 'vscode';
import { HookObserver } from './HookObserver';
import { copyToClipboard } from '../../helpers/clipboard';
import HookLabelTreeItem from './HookLabelTreeItem';
import SettingTool from '../../classes/tools/SettingTool';
import { HookDetailsTreeItem } from './HookDetailsTreeItem';
import EditorTool from '../../classes/tools/EditorTool';

export function registerHookCommands(hookObserver: HookObserver) {
  commands.registerCommand('sfccBeaver.refreshHooksList', async () => {
    await hookObserver.loadHookPoints();
    hookObserver.refresh();
  });

  commands.registerCommand('sfccBeaver.copyHookName', async (treeItem: HookLabelTreeItem) => {
    copyToClipboard(treeItem.hookPoint.name);
  });

  commands.registerCommand('sfccBeaver.pinHook', async (treeItem: HookLabelTreeItem) => {
    await SettingTool.addToList('pinnedHooks', treeItem.hookPoint.name);
    await hookObserver.loadHookPoints();
    hookObserver.refresh();
  });

  commands.registerCommand('sfccBeaver.unpinHook', async (treeItem: HookLabelTreeItem) => {
    await SettingTool.removeFromList('pinnedHooks', treeItem.hookPoint.name);
    await hookObserver.loadHookPoints();
    hookObserver.refresh();
  });

  commands.registerCommand('sfccBeaver.openHookFile', async (hookItem: HookDetailsTreeItem) => {
    await EditorTool.focusOnWorkspaceFile(hookItem.hookImplementation.location, {
      preview: hookObserver.lastClickedDetailsTreeItem !== hookItem, //double click
    });

    hookObserver.lastClickedDetailsTreeItem = hookItem;
  });

  commands.registerCommand('sfccBeaver.openHookDefinitionFile', async (hookItem: HookDetailsTreeItem) => {
    EditorTool.focusOnWorkspaceFile(hookItem.hookImplementation.definitionFileLocation);
  });
}
