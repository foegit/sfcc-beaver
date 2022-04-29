import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import BeaverError, { ErrCodes } from '../../errors/BeaverError';
import SFCCCartridge from '../../SFCCCartridge';
import SFCCProject from '../../SFCCProject';
import IFileCreator from '../IFileCreator';
import IFileAppender from '../IFileAppender';
import CartridgeListItemDecorator from './CartridgeListItemDecorator';
class FileOverrider {
    constructor(
        private activeEditor : vscode.TextEditor,
        private sfccProject : SFCCProject,
        private fileCreator: IFileCreator,
        private fileAppender: IFileAppender
    ) {}

    async override() {
        const targetCartridge = await this.selectTargetCartridge();

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

    private async selectTargetCartridge() {
        const currentCartridgePath = this.activeEditor.document.uri.fsPath;

        const sfccCartridges = this.sfccProject.getCartridges().filter(sfccCartridge => {
            const selectedCartridgeRegExp = new RegExp(`^.*[\\\\/]${sfccCartridge.getName()}[\\\\/].*$`);

            return !selectedCartridgeRegExp.test(currentCartridgePath);
        });

        const decoratedCartridges = sfccCartridges.map(sfccCartridge => new CartridgeListItemDecorator(sfccCartridge));
        const sortedDecorateCartridges = this.sortByPriority(decoratedCartridges);
        const selectionList : string[] = sortedDecorateCartridges.map(cartridge => cartridge.getPrintableName());

        const selectedCartridgeName = await vscode.window.showQuickPick(selectionList) || '';
        const originalCartridgeName = CartridgeListItemDecorator.parseOriginalName(selectedCartridgeName);
        const selectedCartridge = this.sfccProject.getCartridgeByName(originalCartridgeName);


        if (!selectedCartridge) {
            throw new BeaverError(ErrCodes.cartridgeIsUnknown, selectedCartridgeName);
        }

        return selectedCartridge;
    }

    private sortByPriority(decoratedCartridges: CartridgeListItemDecorator[]): CartridgeListItemDecorator[] {
        decoratedCartridges.sort((c1, c2) => {
            return c2.getPriority() - c1.getPriority();
        });

        return decoratedCartridges;
    }

    protected getTargetPath(currentCartridge: SFCCCartridge) {
        const currentPath = this.activeEditor.document.uri.fsPath;
        const relativeCurrentCartridge = /^.*(cartridge.*)$/.exec(currentPath);

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
