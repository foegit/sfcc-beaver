import { commands } from 'vscode';
import { HookObserver } from './HookObserver';
import { copyToClipboard } from '../../helpers/clipboard';
import HookLabelTreeItem from './treeItems/HookLabelTreeItem';
import { HookDetailsTreeItem } from './treeItems/HookDetailsTreeItem';
import EditorTool from '../../classes/tools/EditorTool';
import { addToSettingList, removeFromSettingList, updateSetting } from '../../helpers/settings';

export function registerHookCommands(hookObserver: HookObserver) {
  commands.registerCommand('sfccBeaver.hooks.refreshView', async () => {
    await hookObserver.loadHookPoints();
    hookObserver.refresh();
  });

  commands.registerCommand('sfccBeaver.hooks.copyName', async (treeItem: HookLabelTreeItem) => {
    copyToClipboard(treeItem.hookPoint.name);
  });

  commands.registerCommand('sfccBeaver.hooks.pin', async (treeItem: HookLabelTreeItem) => {
    await addToSettingList('hooks.pinnedHooks', treeItem.hookPoint.name);
    await hookObserver.loadHookPoints();
    hookObserver.refresh();
  });

  commands.registerCommand('sfccBeaver.hooks.unpin', async (treeItem: HookLabelTreeItem) => {
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

  commands.registerCommand('sfccBeaver.hooks.useCompactView', async () => {
    await updateSetting('hooks.singeHookViewMode', 'compact');
    hookObserver.refresh();
  });

  commands.registerCommand('sfccBeaver.hooks.useFullView', async () => {
    await updateSetting('hooks.singeHookViewMode', 'full');
    hookObserver.refresh();
  });

  commands.registerCommand(
    'sfccBeaver.hooks.openImplementation',
    async (hookItem: HookDetailsTreeItem | HookLabelTreeItem) => {
      const implementation =
        hookItem instanceof HookDetailsTreeItem ? hookItem.hookImplementation : hookItem.hookPoint.implementation[0];

      // dw.order.calculate -> calculate
      const hookNameLastPart = implementation.hookName.split('.').pop();
      /**
       * /(calculate\s*)[(=:]/ which covers
       * function calculate () - function
       * exports.calculate = - short export
       * module.exports = { calculate: } - module export
       */
      const hookFunctionRegExp = new RegExp(`(${hookNameLastPart}\\s*)[(=:]`);

      await EditorTool.focusOnWorkspaceFile(implementation.location, {
        preview: hookObserver.lastClickedDetailsTreeItem !== hookItem, //double click
        focusOnText: hookFunctionRegExp,
      });

      hookObserver.lastClickedDetailsTreeItem = hookItem;
    }
  );

  commands.registerCommand(
    'sfccBeaver.hooks.openHookDefinition',
    async (hookItem: HookDetailsTreeItem | HookLabelTreeItem) => {
      const hookImplementation =
        hookItem instanceof HookDetailsTreeItem ? hookItem.hookImplementation : hookItem.hookPoint.implementation[0];

      EditorTool.focusOnWorkspaceFile(hookImplementation.definitionFileLocation, {
        focusOnText: new RegExp(`(${hookImplementation.hookName})`),
      });
    }
  );
}
