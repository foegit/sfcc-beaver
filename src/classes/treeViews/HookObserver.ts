import * as vscode from 'vscode';
import * as fg from 'fast-glob';
import * as fs from 'fs';
import BeaverError, { ErrCodes } from '../errors/BeaverError';
import * as path from 'path';
import FsTool from '../tools/FsTool';
import HookTreeItem, { HookTreeSubItem } from './treeItems/HookTreeItem';

export type HookSFCCDefinitionType = {
    name: string;
    script: string;
};

export type ParsedHookType = {
    cartridge: string;
    hooksFile: string;
    packageJsonFile: string;
    hooks: {
        hooks: HookSFCCDefinitionType[];
    };
};

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

    async getChildren(element?: HookTreeItem): Promise<vscode.TreeItem[]> {
        if (!vscode.workspace.workspaceFolders) {
            throw new BeaverError(ErrCodes.noActiveEditor);
        }

        if (element) {
            return element.hook.hooks.hooks.map(
                (hook) => new HookTreeSubItem(hook)
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

        const hooksRegistry: ParsedHookType[] = [];

        packageFiles.forEach((filePath) => {
            const content = FsTool.parseCurrentProjectJsonFile(filePath);

            if (!content || !content.hooks) {
                return;
            }

            const hookPath = path.resolve(
                filePath.replace('package.json', ''),
                content.hooks
            );

            const hooks = FsTool.parseCurrentProjectJsonFile(hookPath);
            const cartridgeNameParse = filePath.match(/.*\/(.*)\/package.json/);

            hooksRegistry.push({
                cartridge: cartridgeNameParse
                    ? cartridgeNameParse[1]
                    : 'Unknown',
                hooksFile: hookPath,
                packageJsonFile: filePath,
                hooks,
            });
        });

        const treeItems: vscode.TreeItem[] = hooksRegistry.map((hook) => {
            return new HookTreeItem(hook);
        });

        return Promise.resolve(treeItems);
    }
}
