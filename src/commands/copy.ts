import * as vscode from 'vscode';
import ParsedCartridgePath from '../classes/ParsedCartridgePath';

const fileHandlers = new Map();

fileHandlers.set('js', function (cartridgePath: ParsedCartridgePath) {
        const scriptRequire = `var ${cartridgePath.getFileName()} = require('*/${cartridgePath.getRelatedPath()}');`;

        vscode.env.clipboard.writeText(scriptRequire);

        const message = `Copied to clipboard: ${scriptRequire}`;
        vscode.window.showInformationMessage(message);
    }
);

fileHandlers.set('isml', function (cartridgePath: ParsedCartridgePath) {
        const templatePath = cartridgePath.getTemplatePath();

        if (templatePath === '') {
            throw new Error('Template is not recognized');
        }

        const templateIsinclude = `<isinclude template="${templatePath}" />`;

        vscode.env.clipboard.writeText(templateIsinclude);

        const message = `Copied to clipboard: ${templateIsinclude}`;
        vscode.window.showInformationMessage(message);
    }
);

fileHandlers.set('properties', function (cartridgePath: ParsedCartridgePath) {
        const propertiesGroup = cartridgePath.getPropertiesGroup();

        const resourceMsg = `Resource.msg('field.shipping.address.first.name', '${propertiesGroup}', null)`;

        vscode.env.clipboard.writeText(resourceMsg);

        const message = `Copied to clipboard: ${resourceMsg}`;
        vscode.window.showInformationMessage(message);
    }
);

export function copyInclude() {
    const activeTextEditor = vscode.window.activeTextEditor;

    if (!activeTextEditor) {
        vscode.window.showErrorMessage('No open file in the moment');
        return;
    }

    const filePath = activeTextEditor.document.uri.path;

    try {
        const cartridgePath = new ParsedCartridgePath(filePath);
        const extension = cartridgePath.getFiletype();

        if (fileHandlers.has(extension)) {
            fileHandlers.get(extension)(cartridgePath);
        } else {
            throw new Error('Unsupported file type');
        }

    } catch (error) {
        vscode.window.showErrorMessage('Current file is not recognized as SFCC supported file. Extension expects /cartridge/ in path. Only .js files can be handled');
    }
}
