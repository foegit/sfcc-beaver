import * as vscode from 'vscode';
import * as fg from 'fast-glob';
import * as fs from 'fs';
import BeaverError, { ErrCodes } from '../../errors/BeaverError';
import * as path from 'path';
import FsTool from '../../tools/FsTool';
import { HookDetailsTreeItem } from './HookDetailsTreeItem';
import HookLabelTreeItem from './HookLabelTreeItem';

export type HookSFCCDefinitionType = {
    name: string;
    script: string;
};

export type HookImplementationType = {
    location: string;
    connected: boolean;
    cartridge: string;
};

export type HookType = {
    name: string;
    implementation: HookImplementationType[];
};

export type ParsedHookType = {
    cartridge: string;
    hooksFile: string;
    packageJsonFile: string;
    hooks: {
        hooks: HookSFCCDefinitionType[];
    };
};

function normalizeScriptPath(path: string) {
    const relativePath = path.replace('~', './'); // ensure no "~"

    if (/.*\.js/.test(relativePath)) {
        return relativePath;
    }

    return `${relativePath}.js`;
}

function isHookConnected(path: string) {
    fs;
}

export class HookObserver implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<
        vscode.TreeItem | undefined | void
    > = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<
        vscode.TreeItem | undefined | void
    > = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: HookLabelTreeItem): Promise<vscode.TreeItem[]> {
        if (!vscode.workspace.workspaceFolders) {
            throw new BeaverError(ErrCodes.noActiveEditor);
        }

        if (element && element instanceof HookLabelTreeItem) {
            return element.hook.implementation.map(
                (hook) => new HookDetailsTreeItem(hook)
            );
        }

        const [workspaceFolder] = vscode.workspace.workspaceFolders;

        const packageFiles = await fg('**/package.json', {
            cwd: workspaceFolder.uri.fsPath,
            ignore: [
                '**/node_modules/**',
                '**/test/mocks/**',
                './package.json',
            ],
        });

        const hookMap: {
            [key: string]: HookType;
        } = {};

        const hooksRegistry: ParsedHookType[] = [];

        packageFiles.forEach((filePath) => {
            const content = FsTool.parseCurrentProjectJsonFile(filePath);

            if (!content || !content.hooks) {
                return;
            }

            const cartridgeRoot = filePath.replace('package.json', '');
            const hooksFilePath = path.resolve(cartridgeRoot, content.hooks);
            const hooksFileLocationRoot = hooksFilePath.replace(
                'hooks.json',
                ''
            );

            const hooks: { hooks: HookSFCCDefinitionType[] } =
                FsTool.parseCurrentProjectJsonFile(hooksFilePath);
            const cartridgeNameParse = filePath.match(/.*\/(.*)\/package.json/);

            hooks.hooks.map((h) => {
                if (!hookMap[h.name]) {
                    hookMap[h.name] = {
                        name: h.name,
                        implementation: [],
                    };
                }

                const scriptFilePath = path.resolve(
                    hooksFileLocationRoot,
                    normalizeScriptPath(h.script)
                );

                hookMap[h.name].implementation.push({
                    location: scriptFilePath,
                    connected: FsTool.fileExist(scriptFilePath),
                    cartridge: cartridgeNameParse ? cartridgeNameParse[1] : '',
                });
            });

            hooksRegistry.push({
                cartridge: cartridgeNameParse
                    ? cartridgeNameParse[1]
                    : 'Unknown',
                hooksFile: hooksFilePath,
                packageJsonFile: filePath,
                hooks,
            });
        });

        const treeItems = Object.keys(hookMap)
            .sort((key1, key2) => key1.localeCompare(key2))
            .map((hookName) => {
                return new HookLabelTreeItem(hookMap[hookName]);
            });

        return Promise.resolve(treeItems);
    }
}
