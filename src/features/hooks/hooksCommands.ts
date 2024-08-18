import { commands, QuickInputButton, QuickPickItem, QuickPickItemKind, ThemeIcon, window } from 'vscode';
import { copyToClipboard } from '../../helpers/clipboard';
import HookLabelTreeItem from './treeItems/HookLabelTreeItem';
import { HookDetailsTreeItem } from './treeItems/HookDetailsTreeItem';
import EditorTool from '../../classes/tools/EditorTool';
import { addToSettingList, removeFromSettingList, updateSetting } from '../../helpers/settings';
import { getIconNameForHook, HookImplementation } from './hooksHelpers';
import HookModule from './HookModule';

class HookPickItem implements QuickPickItem {
  label: string;
  description?: string | undefined;
  detail?: string | undefined;
  picked?: boolean | undefined;
  buttons?: readonly QuickInputButton[] | undefined;

  constructor(public implementation: HookImplementation) {
    this.label = `$(${getIconNameForHook(this.implementation.hookName)}) ${this.implementation.hookName}`;
    this.description = implementation.cartridge;
    // TODO: maybe make it configurable
    // this.detail = `${implementation.cartridgeRelatedPath}`;
  }
}

class HookPickItemSep implements QuickPickItem {
  label: string;
  kind?: QuickPickItemKind | undefined;

  constructor(cartridge: string) {
    this.label = `${cartridge}`;
    this.kind = QuickPickItemKind.Separator;
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

export function registerHookCommands(hookModule: HookModule) {
  async function reParseAndRefreshView() {
    await hookModule.parseHooks();

    hookModule.refreshHooksView();
  }

  hookModule.commandRegistry.add('sfccBeaver.hooks.refreshView', reParseAndRefreshView);

  hookModule.commandRegistry.add('sfccBeaver.hooks.copyName', async (treeItem: HookLabelTreeItem) => {
    copyToClipboard(treeItem.hookPoint.name);
  });

  hookModule.commandRegistry.add('sfccBeaver.hooks.pin', async (treeItem: HookLabelTreeItem) => {
    await addToSettingList('hooks.pinnedHooks', treeItem.hookPoint.name);

    reParseAndRefreshView();
  });

  hookModule.commandRegistry.add('sfccBeaver.hooks.unpin', async (treeItem: HookLabelTreeItem) => {
    await removeFromSettingList('hooks.pinnedHooks', treeItem.hookPoint.name);

    reParseAndRefreshView();
  });

  hookModule.commandRegistry.add('sfccBeaver.hooks.useListView', async () => {
    await updateSetting('hooks.viewMode', 'list');

    hookModule.refreshHooksView();
  });

  hookModule.commandRegistry.add('sfccBeaver.hooks.useTagView', async () => {
    await updateSetting('hooks.viewMode', 'tag');

    hookModule.refreshHooksView();
  });

  hookModule.commandRegistry.add('sfccBeaver.hooks.useCompactView', async () => {
    await updateSetting('hooks.singeHookViewMode', 'compact');

    hookModule.refreshHooksView();
  });

  hookModule.commandRegistry.add('sfccBeaver.hooks.useFullView', async () => {
    await updateSetting('hooks.singeHookViewMode', 'full');

    hookModule.refreshHooksView();
  });

  hookModule.commandRegistry.add('sfccBeaver.hooks.collapseAll', async () => {
    commands.executeCommand('workbench.actions.treeView.hooksObserver.collapseAll');
  });

  hookModule.commandRegistry.add('sfccBeaver.hooks.search', async () => {
    const items: (HookPickItem | HookPickItemSep)[] = [];

    const sortedHookPoints = (await hookModule.getHookPoints()).sort((h1, h2) => h1.name.localeCompare(h2.name));
    const cartridgeToHookMap: { [key: string]: HookImplementation[] } = {};

    sortedHookPoints.forEach((hookPoint) => {
      hookPoint.implementation.forEach((imp) => {
        if (!cartridgeToHookMap[imp.cartridge]) {
          cartridgeToHookMap[imp.cartridge] = [];
        }

        cartridgeToHookMap[imp.cartridge].push(imp);
      });
    });

    Object.keys(cartridgeToHookMap)
      .sort((c1, c2) => c1.localeCompare(c2))
      .forEach((key) => {
        items.push(new HookPickItemSep(key));

        cartridgeToHookMap[key].forEach((imp) => {
          items.push(new HookPickItem(imp));
        });
      });

    const result = await window.showQuickPick(items, {
      title: 'Search hook',
      placeHolder: 'Enter hook name',
      matchOnDescription: true,
    });

    if (result && result instanceof HookPickItem) {
      openHookImplementation(result.implementation, true);
    }
  });

  hookModule.commandRegistry.add('sfccBeaver.hooks.filter', async () => {
    const result = await window.showInputBox({
      title: 'Enter Filter',
      value: hookModule.getFilterQuery(),
    });

    if (typeof result === 'string') {
      hookModule.applyFilterQuery(result);
    }
  });

  let lastFilterDoubleClick: Date | null = null;

  hookModule.commandRegistry.add('sfccBeaver.hooks.filterDoubleClick', function () {
    let currentClick = new Date();

    if (!lastFilterDoubleClick || currentClick.valueOf() - lastFilterDoubleClick.valueOf() > 1000) {
      lastFilterDoubleClick = currentClick;
      return;
    }

    commands.executeCommand('sfccBeaver.hooks.filter');
  });

  hookModule.commandRegistry.add('sfccBeaver.hooks.clearFilter', async () => {
    hookModule.applyFilterQuery('');
  });

  hookModule.commandRegistry.add(
    'sfccBeaver.hooks.openImplementation',
    async (hookItem: HookDetailsTreeItem | HookLabelTreeItem) => {
      const implementation =
        hookItem instanceof HookDetailsTreeItem ? hookItem.hookImplementation : hookItem.hookPoint.implementation[0];

      const provider = hookModule.getHookDataTreeProvider();
      const isDoubleClick = provider.lastClickedDetailsTreeItem !== hookItem;

      openHookImplementation(implementation, isDoubleClick);
      provider.lastClickedDetailsTreeItem = hookItem;
    }
  );

  hookModule.commandRegistry.add(
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
