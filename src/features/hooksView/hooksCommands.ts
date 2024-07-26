import { commands } from 'vscode';
import { HookObserver } from './HookObserver';
import { copyToClipboard } from '../../helpers/clipboard';
import HookLabelTreeItem from './treeItems/HookLabelTreeItem';
import { HookDetailsTreeItem } from './treeItems/HookDetailsTreeItem';
import EditorTool from '../../classes/tools/EditorTool';
import { addToSettingList, removeFromSettingList, updateSetting } from '../../helpers/settings';

export function registerHookCommands(hookObserver: HookObserver) {
  commands.registerCommand('sfccBeaver.refreshHooksList', async () => {
    await hookObserver.loadHookPoints();
    hookObserver.refresh();
  });

  commands.registerCommand('sfccBeaver.copyHookName', async (treeItem: HookLabelTreeItem) => {
    copyToClipboard(treeItem.hookPoint.name);
  });

  commands.registerCommand('sfccBeaver.pinHook', async (treeItem: HookLabelTreeItem) => {
    await addToSettingList('hooks.pinnedHooks', treeItem.hookPoint.name);
    await hookObserver.loadHookPoints();
    hookObserver.refresh();
  });

  commands.registerCommand('sfccBeaver.unpinHook', async (treeItem: HookLabelTreeItem) => {
    await removeFromSettingList('hooks.pinnedHooks', treeItem.hookPoint.name);
    await hookObserver.loadHookPoints();
    hookObserver.refresh();
  });

  commands.registerCommand('sfccBeaver.hooks.useListView', async () => {
    await updateSetting('hooks.viewMode', 'list');
    hookObserver.refresh();
  });

  commands.registerCommand('sfccBeaver.hooks.useTagView', async () => {
    await updateSetting('hooks.viewMode', 'tag');
    hookObserver.refresh();
  });

  commands.registerCommand('sfccBeaver.openHookFile', async (hookItem: HookDetailsTreeItem) => {
    // dw.order.calculate -> calculate
    const hookNameLastPart = hookItem.hookImplementation.hookName.split('.').pop();
    /**
     * /(calculate\s*)[(=:]/ which covers
     * function calculate () - function
     * exports.calculate = - short export
     * module.exports = { calculate: } - module export
     */
    const hookFunctionRegExp = new RegExp(`(${hookNameLastPart}\\s*)[(=:]`);

    await EditorTool.focusOnWorkspaceFile(hookItem.hookImplementation.location, {
      preview: hookObserver.lastClickedDetailsTreeItem !== hookItem, //double click
      focusOnText: hookFunctionRegExp,
    });

    hookObserver.lastClickedDetailsTreeItem = hookItem;
  });

  commands.registerCommand('sfccBeaver.openHookDefinitionFile', async (hookItem: HookDetailsTreeItem) => {
    EditorTool.focusOnWorkspaceFile(hookItem.hookImplementation.definitionFileLocation);
  });
}
