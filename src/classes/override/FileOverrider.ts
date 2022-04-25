import * as path from 'path';
import * as fs from 'fs';
import { TextEditor, window, workspace, Uri } from 'vscode';
import BeaverError, { ErrCodes } from '../errors/BeaverError';
import SFCCCartridge from '../SFCCCartridge';
import SFCCProject from '../SFCCProject';

const defaultFileTemplate = '// overridden';

class FileOverrider {
    protected sfccProject : SFCCProject;
    protected activeEditor : TextEditor;

    constructor(activeEditor : TextEditor, sfccProject : SFCCProject) {
        this.sfccProject = sfccProject;
        this.activeEditor = activeEditor;
    }

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
        const cartridgesList = this.sfccProject.getCartridges().map(cartridge => cartridge.getName());
        const selectedCartridgeName = await window.showQuickPick(cartridgesList) || '';
        const selectedCartridge = this.sfccProject.getCartridgeByName(selectedCartridgeName);

        if (!selectedCartridge) {
            throw new BeaverError(ErrCodes.cartridgeIsUnknown, selectedCartridgeName);
        }

        return selectedCartridge;
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
        return '// overridden';
    }

    protected createNewTargetFile(targetPath: string) {
        const parsed = path.parse(targetPath);

        fs.mkdirSync(parsed.dir, { recursive: true });
        fs.writeFileSync(targetPath, this.getNewFileSnippet());
    }

    protected getAppendSnippet(): string {
        return '\n// overridden';
    }

    protected appendTargetFile(targetPath: string) {
        fs.appendFileSync(targetPath, this.getAppendSnippet());
    }

    private focusOnFile(filePath: string) {
        var openPath = Uri.parse('file:///' + filePath);

        workspace.openTextDocument(openPath).then(doc => {
            window.showTextDocument(doc);
        });
    }
};

export default FileOverrider;
