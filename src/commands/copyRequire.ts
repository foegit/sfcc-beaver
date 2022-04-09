import * as vscode from 'vscode';

/**
 * d:/work/app_custom/cartridge/scripts/helpers.js
 * 0 - whole match `d:/work/app_custom/cartridge/scripts/helpers.js`
 * 1 - cartridge name - `app_custom`
 * 2 - related path `scripts/helpers.js`
 * 3 - file full name `helpers.js`
 * 4 - file name only `helpers`
 */
const cartridgePathRegExp : RegExp = /^.*\/(.*)\/(cartridge\/.*\/((.*)\..*))$/;

export function copyRequire() {
    const activeTextEditor = vscode.window.activeTextEditor;

    if (!activeTextEditor) {
        vscode.window.showErrorMessage('No open file in the moment');
        return;
    }

    const filePath = activeTextEditor.document.uri.path;
    const parsedPath = cartridgePathRegExp.exec(filePath);

    if (!parsedPath || parsedPath.length < 3) {
        vscode.window.showErrorMessage('Current file is not recognized as SFCC file. Extension expects /cartridge/ in path');
        return;
    }

    const relatedPath = parsedPath[2];
    const requireScript = `var ${parsedPath[4]} = require('*/${relatedPath}');`;

    const message = `Required Script: ${requireScript}`;

    vscode.env.clipboard.writeText(requireScript);

    vscode.window.showInformationMessage(message);
}
