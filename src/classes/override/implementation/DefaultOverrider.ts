import path = require('path');
import * as fs from 'fs';
import * as vscode from 'vscode';
import SFCCProject from '../../SFCCProject';
import IFileOverrider from '../IFileOverrider';

export default class EmptyOverrider implements IFileOverrider {
    override(activeEditor: vscode.TextEditor, sfccProject : SFCCProject) : void {
        const availableCartridges = sfccProject.getCartridges();

        const cartridgeList = availableCartridges.map(cartridge => cartridge.getName());

        vscode.window.showQuickPick(cartridgeList).then((selectedName) => {
            const selectedCartridge = availableCartridges.find(cartridge => {
                return cartridge.getName() === selectedName;
            });

            if (!selectedCartridge) {
                throw new Error('No cartridge');
            }

            const currentPath = activeEditor.document.uri.fsPath;
            const relativeCurrentCartridge = /^.*(cartridge.*)$/.exec(currentPath);


            const targetCartridgePath = selectedCartridge.getCartridgePath();


            const pathToCreate = relativeCurrentCartridge ? relativeCurrentCartridge[1] : '';

            const fullPathToCreate = path.join(targetCartridgePath, pathToCreate);

            const isFileOverridden = fs.existsSync(fullPathToCreate);


            if (isFileOverridden && !fs.statSync(fullPathToCreate).isDirectory()) {
                vscode.window.showInformationMessage('Exist');
                return;
            }

            const parsed = path.parse(fullPathToCreate);

            fs.mkdirSync(parsed.dir, { recursive: true });
            fs.writeFileSync(fullPathToCreate, '// ha');

            vscode.window.showInformationMessage('You selected ' + selectedCartridge?.getName());
        });
    }
}