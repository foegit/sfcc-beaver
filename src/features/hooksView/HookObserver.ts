import * as fg from 'fast-glob';
import * as path from 'path';
import { HookDetailsTreeItem } from './HookDetailsTreeItem';
import HookLabelTreeItem from './HookLabelTreeItem';
import { HookPoint, normalizeScriptPath, SFCCHookDefinition, sortHooks } from './hooksHelpers';
import { commands, Event, EventEmitter, TreeDataProvider, TreeItem, Uri, window, workspace } from 'vscode';
import EditorTool from '../../classes/tools/EditorTool';
import FsTool from '../../classes/tools/FsTool';
import SettingTool from '../../classes/tools/SettingTool';
import { copyToClipboard } from '../../helpers/clipboard';

export class HookObserver implements TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: EventEmitter<TreeItem | undefined | void> = new EventEmitter<
        TreeItem | undefined | void
    >();
    readonly onDidChangeTreeData: Event<TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor() {
        this.initCommands();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    private hookPoints: HookPoint[] = [];
    private sortBy: string = 'default';
    private showSystem: boolean = true;
    private showCommerceApi: boolean = true;
    private showCustom: boolean = true;
    private lastClickedDetailsTreeItem: HookDetailsTreeItem | null = null;

    async loadHookPoints() {
        const workspaceFolder = FsTool.getCurrentWorkspaceFolder();

        const packageJsonFiles = await fg('**/package.json', {
            cwd: workspaceFolder.uri.fsPath,
            ignore: ['**/node_modules/**', '**/test/mocks/**', './package.json'],
        });

        const hookMap = new Map<string, HookPoint>();
        const pinnedHooks = SettingTool.getPinnedHooks();

        packageJsonFiles.forEach((filePath) => {
            const content = FsTool.parseCurrentProjectJsonFile(filePath);

            if (!content || !content.hooks) {
                return;
            }

            const cartridgeRoot = filePath.replace('package.json', '');
            const hooksFilePath = path.join(cartridgeRoot, content.hooks);
            const hooksFileRootFolder = hooksFilePath.replace('hooks.json', '');

            const hooks: { hooks: SFCCHookDefinition[] } = FsTool.parseCurrentProjectJsonFile(hooksFilePath);

            hooks.hooks.map((sfccHook) => {
                if (!hookMap.has(sfccHook.name)) {
                    hookMap.set(sfccHook.name, {
                        name: sfccHook.name,
                        implementation: [],
                        pinned: pinnedHooks.includes(sfccHook.name),
                    });
                }

                const scriptFilePath = path.join(hooksFileRootFolder, normalizeScriptPath(sfccHook.script));

                hookMap.get(sfccHook.name)!.implementation.push({
                    location: scriptFilePath,
                    connected: FsTool.fileExist(scriptFilePath),
                    definitionFileLocation: hooksFilePath,
                });
            });
        });

        this.hookPoints = Array.from(hookMap, ([hookName, hookPoint]) => hookPoint);
    }

    initCommands() {
        commands.registerCommand('sfccBeaver.refreshHooksList', async () => {
            await this.loadHookPoints();
            this.refresh();
        });

        commands.registerCommand('sfccBeaver.copyHookName', async (treeItem: HookLabelTreeItem) => {
            copyToClipboard(treeItem.hookPoint.name);
        });

        commands.registerCommand('sfccBeaver.pinHook', async (treeItem: HookLabelTreeItem) => {
            await SettingTool.addToList('pinnedHooks', treeItem.hookPoint.name);
            await this.loadHookPoints();
            this.refresh();
        });

        commands.registerCommand('sfccBeaver.unpinHook', async (treeItem: HookLabelTreeItem) => {
            await SettingTool.removeFromList('pinnedHooks', treeItem.hookPoint.name);
            await this.loadHookPoints();
            this.refresh();
        });

        commands.registerCommand('sfccBeaver.openHookFile', async (hookItem: HookDetailsTreeItem) => {
            await EditorTool.focusOnWorkspaceFile(hookItem.hookImplementation.location, {
                preview: this.lastClickedDetailsTreeItem !== hookItem, //double click
            });

            this.lastClickedDetailsTreeItem = hookItem;
        });

        commands.registerCommand('sfccBeaver.openHookDefinitionFile', async (hookItem: HookDetailsTreeItem) => {
            EditorTool.focusOnWorkspaceFile(hookItem.hookImplementation.definitionFileLocation);
        });
    }

    getTreeItem(element: TreeItem): TreeItem {
        return element;
    }

    async getChildren(hookLabelTreeItem?: HookLabelTreeItem): Promise<TreeItem[]> {
        if (hookLabelTreeItem) {
            return hookLabelTreeItem.hookPoint.implementation.map((hookImp) => new HookDetailsTreeItem(hookImp));
        }

        if (this.hookPoints.length === 0) {
            await this.loadHookPoints();
        }

        const sortedHookPoints = sortHooks(this.hookPoints, this.sortBy);

        return sortedHookPoints.map((hookPoint) => new HookLabelTreeItem(hookPoint));
    }
}
