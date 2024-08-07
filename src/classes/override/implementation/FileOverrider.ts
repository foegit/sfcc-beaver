import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import BeaverError, { ErrCodes } from '../../errors/BeaverError';
import SFCCCartridge from '../../SFCCCartridge';
import SFCCProject from '../../SFCCProject';
import IFileCreator from '../IFileCreator';
import IFileAppender from '../IFileAppender';
import PathTool from '../../tools/PathTool';
import StaticFileAppender from './FileAppenders/StaticFileAppender';
import EditorTool from '../../tools/EditorTool';

class CartridgePickItem implements vscode.QuickPickItem {
    label: string;
    sfccCartridge: SFCCCartridge;
    description?: string | undefined;
    detail?: string | undefined;

    constructor(sfccCartridge: SFCCCartridge, isTargetFileExists: boolean, isCurrentCartridge: boolean) {
        this.sfccCartridge = sfccCartridge;
        this.label = `$(${sfccCartridge.getIcon()}) ${sfccCartridge.getName()}`;

        if (isCurrentCartridge) {
            this.description = 'currently opened';
        } else if (isTargetFileExists) {
            this.description = 'file exists $(arrow-right)';
        }

        if (sfccCartridge.getName() === 'modules') {
            this.detail = '$(info) Modules is a not overridable cartridge';
        }
    }
}

class FileOverrider {
    constructor(
        private activeEditor: vscode.TextEditor,
        private sfccProject: SFCCProject,
        private fileCreator: IFileCreator,
        private fileAppender: IFileAppender = new StaticFileAppender()
    ) {}

    async override() {
        const targetCartridge = await this.selectTargetCartridge();

        if (!targetCartridge) {
            console.debug('Cartridge is not selected');
            return;
        }

        if (targetCartridge.getName() === 'modules') {
            vscode.window.showErrorMessage(
                'Modules cartridge is not overridable because it is a unique cartridge and works differently'
            );
            return;
        }

        if (targetCartridge.getName() === 'app_storefront_base') {
            vscode.window.showWarningMessage('You override SFRA base cartridge!');
        }

        this.overrideForCartridge(targetCartridge);
    }

    private overrideForCartridge(targetCartridge: SFCCCartridge) {
        const targetPath = this.getTargetPath(targetCartridge);
        const isTargetFileExists = fs.existsSync(targetPath);

        if (isTargetFileExists) {
            this.appendTargetFile(targetPath);
        } else {
            this.createNewTargetFile(targetPath);
        }

        this.focusOnFile(targetPath);
    }

    private async selectTargetCartridge(): Promise<SFCCCartridge | null> {
        const currentCartridgePath = this.activeEditor.document.uri.fsPath;

        const sfccCartridges = await this.sfccProject.getSortedCartridges();

        const selectionList: CartridgePickItem[] = sfccCartridges.map((sfccCartridge) => {
            const targetPath = this.getTargetPath(sfccCartridge);
            const isTargetFileExists = fs.existsSync(targetPath);

            const selectedCartridgeRegExp = new RegExp(`^.*[\\\\/]${sfccCartridge.getName()}[\\\\/].*$`);
            const isCurrentCartridge = selectedCartridgeRegExp.test(currentCartridgePath);

            return new CartridgePickItem(sfccCartridge, isTargetFileExists, isCurrentCartridge);
        });

        const selectedCartridgeItem =
            (await vscode.window.showQuickPick(selectionList, {
                title: 'Select the cartridge',
            })) || '';

        return selectedCartridgeItem ? selectedCartridgeItem.sfccCartridge : null;
    }

    protected getTargetPath(currentCartridge: SFCCCartridge) {
        const currentPath = this.activeEditor.document.uri.fsPath;

        if (PathTool.hasSubPath(currentPath, 'cartridges/modules')) {
            throw new BeaverError(ErrCodes.modulesOverride);
        }

        if (!PathTool.hasFolder(currentPath, 'cartridge')) {
            throw new BeaverError(ErrCodes.notInCartridgeOverride);
        }

        const relativeCurrentCartridge = /^.*(cartridge[\/\\].*)$/.exec(currentPath);
        const targetCartridgePath = currentCartridge.getCartridgePath();
        const pathToCreate = relativeCurrentCartridge ? relativeCurrentCartridge[1] : '';
        const fullTargetPath = path.join(targetCartridgePath, pathToCreate);

        return fullTargetPath;
    }

    protected getNewFileSnippet(): string {
        return this.fileCreator.create(this.activeEditor);
    }

    protected createNewTargetFile(targetPath: string) {
        const parsed = path.parse(targetPath);

        fs.mkdirSync(parsed.dir, { recursive: true });
        fs.writeFileSync(targetPath, this.getNewFileSnippet());
    }

    protected getAppendSnippet(): string {
        return this.fileAppender.append(this.activeEditor);
    }

    protected appendTargetFile(targetPath: string) {
        const appendText = this.getAppendSnippet();

        if (appendText) {
            fs.appendFileSync(targetPath, appendText);
        }
    }

    private async focusOnFile(filePath: string) {
        const textDocument = await EditorTool.focusOnFile(filePath);
        const targetPosition = this.getFocusPosition(textDocument);

        vscode.commands
            .executeCommand('cursorMove', {
                to: 'down',
                by: 'line',
                value: targetPosition.line,
            })
            .then(() =>
                vscode.commands.executeCommand('cursorMove', {
                    to: 'right',
                    by: 'character',
                    value: targetPosition.character,
                })
            );
    }

    protected getFocusPosition(createdTextDocument: vscode.TextDocument): vscode.Position {
        return new vscode.Position(createdTextDocument.lineCount, 0);
    }
}

export default FileOverrider;
