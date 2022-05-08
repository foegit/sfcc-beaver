import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import BeaverError, { ErrCodes } from '../../errors/BeaverError';
import SFCCCartridge from '../../SFCCCartridge';
import SFCCProject from '../../SFCCProject';
import IFileCreator from '../IFileCreator';
import IFileAppender from '../IFileAppender';
import PathTool from '../../tools/PathTool';
import SFCCProjectFile from '../../SFCCProjectFile';
class FileOverrider {
    constructor(
        private activeEditor : vscode.TextEditor,
        private sfccProject : SFCCProject,
        private fileCreator: IFileCreator,
        private fileAppender: IFileAppender
    ) {}

    async override() {
        const targetCartridge = await this.selectTargetCartridge();

        if (!targetCartridge) {
            console.log('Cartridge is not selected');
            return;
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

    private async selectTargetCartridge(): Promise<SFCCCartridge|null> {
        const currentCartridgePath = this.activeEditor.document.uri.fsPath;

        const sfccCartridges = this.sfccProject.getCartridges().filter(sfccCartridge => {
            if (sfccCartridge.getName() === 'modules') {
                // Skip modules cartridge
                return false;
            }

            const selectedCartridgeRegExp = new RegExp(`^.*[\\\\/]${sfccCartridge.getName()}[\\\\/].*$`);

            return !selectedCartridgeRegExp.test(currentCartridgePath);
        });

        const sortedCartridges = SFCCCartridge.sortByPriority(sfccCartridges);
        const selectionList : string[] = sortedCartridges.map(cartridge => cartridge.getPrintableName());

        const selectedCartridgeName = await vscode.window.showQuickPick(selectionList) || '';
        const originalCartridgeName = SFCCCartridge.parseOriginalName(selectedCartridgeName);

        if (!selectedCartridgeName) {
            // nothing is selected
            return null;
        }

        const selectedCartridge = this.sfccProject.getCartridgeByName(originalCartridgeName);

        if (!selectedCartridge) {
            throw new BeaverError(ErrCodes.cartridgeIsUnknown, selectedCartridgeName);
        }

        return selectedCartridge;
    }

    protected getTargetPath(currentCartridge: SFCCCartridge) {
        const currentPath = this.activeEditor.document.uri.fsPath;

        if (PathTool.hasFolder(currentPath, 'modules')) {
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

    private focusOnFile(filePath: string) {
        var openPath = vscode.Uri.parse('file:///' + filePath);

        vscode.workspace.openTextDocument(openPath).then(textDocument => {
            vscode.window.showTextDocument(textDocument);

            const targetPosition = this.getFocusPosition(textDocument);

            vscode.commands
                .executeCommand('cursorMove', {
                    to: 'down',
                    by: 'line',
                    value: targetPosition.line,
                })
                .then(() =>vscode.commands.executeCommand('cursorMove', {
                    to: 'right',
                    by: 'character',
                    value: targetPosition.character,
                })
            );

        });
    }

    protected getFocusPosition(createdTextDocument: vscode.TextDocument): vscode.Position {
        return new vscode.Position(createdTextDocument.lineCount, 2);
    }
};

export default FileOverrider;
