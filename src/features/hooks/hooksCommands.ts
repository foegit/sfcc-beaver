import { commands, QuickPickItem, window } from 'vscode';
import { HookObserver } from './HookObserver';
import { copyToClipboard } from '../../helpers/clipboard';
import HookLabelTreeItem from './treeItems/HookLabelTreeItem';
import { HookDetailsTreeItem } from './treeItems/HookDetailsTreeItem';
import EditorTool from '../../classes/tools/EditorTool';
import { addToSettingList, removeFromSettingList, updateSetting } from '../../helpers/settings';
import { getIconNameForHook, HookImplementation } from './hooksHelpers';
import { parseCartridgePath } from '../cartridgesView/cartridgesHelpers';

class HookPickItem implements QuickPickItem {
  label: string;
  description?: string | undefined;
  detail?: string | undefined;

  constructor(public implementation: HookImplementation) {
    const parsed = parseCartridgePath(this.implementation.location);
    this.label = `$(${getIconNameForHook(this.implementation.hookName)}) ${this.implementation.hookName}`;
    this.description = `${parsed.cartridge} ·  ${parsed.cartridgeRelatedPath}`;
  }
}

async function openHookImplementation(implementation: HookImplementation, preview = false) {
  // dw.order.calculate -> calculate
  const hookNameLastPart = implementation.hookName.split('.').pop();
  /**
   * /(calculate\s*)[(=:]/ which covers
   * function calculate () - function
   * exports.calculate = - short export
   * module.exports = { calculate: } - module export
   */
  const hookFunctionRegExp = new RegExp(`(${hookNameLastPart})\\s*[(=:]`);

  await EditorTool.focusOnWorkspaceFile(implementation.location, {
    preview,
    focusOnText: hookFunctionRegExp,
  });
}

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

  commands.registerCommand('sfccBeaver.hooks.collapseAll', async () => {
    commands.executeCommand('workbench.actions.treeView.hooksObserver.collapseAll');
  });

  commands.registerCommand('sfccBeaver.hooks.search', async () => {
    const items: HookPickItem[] = [];
    const sortedHookPoints = hookObserver.getHookPoints().sort((h1, h2) => h1.name.localeCompare(h2.name));

    sortedHookPoints.forEach((hookPoint) => {
      hookPoint.implementation.forEach((imp) => {
        items.push(new HookPickItem(imp));
      });
    });

    const result = await window.showQuickPick(items, {
      title: 'Search hook',
    });

    if (result) {
      openHookImplementation(result.implementation, true);
    }
  });

  commands.registerCommand('sfccBeaver.hooks.filter', async () => {
    const result = await window.showInputBox({
      title: 'Enter Filter',
      value: hookObserver.getFilterQuery(),
    });

    if (typeof result === 'string') {
      hookObserver.filter(result);
    }
  });

  let lastFilterDoubleClick: Date | null = null;

  commands.registerCommand('sfccBeaver.hooks.filterDoubleClick', function () {
    let currentClick = new Date();

    if (!lastFilterDoubleClick || currentClick.valueOf() - lastFilterDoubleClick.valueOf() > 1000) {
      lastFilterDoubleClick = currentClick;
      return;
    }

    commands.executeCommand('sfccBeaver.hooks.filter');
  });

  commands.registerCommand('sfccBeaver.hooks.clearFilter', async () => {
    hookObserver.filter('');
  });

  commands.registerCommand(
    'sfccBeaver.hooks.openImplementation',
    async (hookItem: HookDetailsTreeItem | HookLabelTreeItem) => {
      const implementation =
        hookItem instanceof HookDetailsTreeItem ? hookItem.hookImplementation : hookItem.hookPoint.implementation[0];

      const isDoubleClick = hookObserver.lastClickedDetailsTreeItem !== hookItem;

      openHookImplementation(implementation, isDoubleClick);
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
