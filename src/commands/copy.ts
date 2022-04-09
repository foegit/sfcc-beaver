import * as vscode from 'vscode';
import ParsedCartridgePath from '../classes/ParsedCartridgePath';

const fileHandlers = new Map();

fileHandlers.set('js', function (cartridgePath: ParsedCartridgePath) {
        const requireScript = `var ${cartridgePath.getFileName()} = require('*/${cartridgePath.getRelatedPath()}');`;

        vscode.env.clipboard.writeText(requireScript);

        const message = `Copied to clipboard: ${requireScript}`;
        vscode.window.showInformationMessage(message);
    }
);

fileHandlers.set('isml', function (cartridgePath: ParsedCartridgePath) {
        const templatePath = cartridgePath.getTemplatePath();

        if (templatePath === '') {
            throw new Error('Template is not recognized');
        }

        const isinclude = `<isinclude template="${templatePath}" />`;

        vscode.env.clipboard.writeText(isinclude);

        const message = `Copied to clipboard: ${isinclude}`;
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
