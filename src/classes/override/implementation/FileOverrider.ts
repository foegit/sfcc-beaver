import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import BeaverError, { ErrCodes } from '../../errors/BeaverError';
import SFCCCartridge from '../../SFCCCartridge';
import SFCCProject from '../../SFCCProject';
import IFileCreator from '../IFileCreator';
import IFileAppender from '../IFileAppender';
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
        const cartridgesList1 = this.sfccProject.getCartridges().map(cartridge => cartridge.getName());
        const cartridgesList2 = this.sortCartridges(cartridgesList1);
        const cl3 : string[] = cartridgesList2.map(c => {
            // @ts-ignore
            return c.name + '(' + c.weight + ')';
        });

        const selectedCartridgeName = await vscode.window.showQuickPick(cl3) || '';
        const selectedCartridge = this.sfccProject.getCartridgeByName(selectedCartridgeName);

        if (!selectedCartridge) {
            throw new BeaverError(ErrCodes.cartridgeIsUnknown, selectedCartridgeName);
        }

        return selectedCartridge;
    }

    private sortCartridges(cartridges: string[]): Object[] {
        const weightedCartridges = cartridges.map(cartridge => {
            return {
                name: cartridge,
                weight: this.getWeightOfCartridge(cartridge)
            };
        });

        weightedCartridges.sort((c1, c2) => {
            return c2.weight - c1.weight;
        });

        return weightedCartridges;
    }

    private prefixWeight: Map<string, number> = new Map([
        ['app', 10000],
        ['int', 1000],
        ['link', 1000],
        ['plugin', 1000],
        ['bc', 100]
    ]);

    private endOfList = ['modules', 'app_storefront_base'];

    private getWeightOfCartridge(cartridgeName: string): number {
        if (this.endOfList.includes(cartridgeName)) {
            return -1000;
        }

        const prefix = /^([^_]*)_.*$/.exec(cartridgeName);

        if (prefix) {
            return this.prefixWeight.get(prefix[1]) || 0;
        }

        return 0;
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
