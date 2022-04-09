import * as vscode from 'vscode';
import BeaverError, { ErrCodes } from '../classes/errors/BeaverError';
import ParsedCartridgePath from '../classes/ParsedCartridgePath';

const fileHandlers = new Map();

function toClipBoard(snippet: string) {
    vscode.env.clipboard.writeText(snippet);
    vscode.window.showInformationMessage(`🦫 Copied!\n${snippet}`);
}

fileHandlers.set('js', function (cartridgePath: ParsedCartridgePath) {
        const scriptRequire = `var ${cartridgePath.getFileName()} = require('*/${cartridgePath.getRelatedPath()}');`;

        toClipBoard(scriptRequire);
    }
);

fileHandlers.set('isml', function (cartridgePath: ParsedCartridgePath) {
        const templatePath = cartridgePath.getTemplatePath();

        if (templatePath === '') {
            throw new Error('Template is not recognized');
        }

        const templateIsinclude = `<isinclude template="${templatePath}" />`;

        toClipBoard(templateIsinclude);
    }
);

fileHandlers.set('properties', function (cartridgePath: ParsedCartridgePath, activeEditor : vscode.TextEditor ) {
        const propertyGroup = cartridgePath.getPropertiesGroup();

        const { text } = activeEditor.document.lineAt(activeEditor.selection.active.line);
        const selectedLineContent = text.trim();

        if (!selectedLineContent) {
            throw new BeaverError(ErrCodes.propertiesEmptyLine);
        }

        const propertyRegExp = /^([^#]+)=.*$/;
        const parsedProperty = propertyRegExp.exec(selectedLineContent);

        if (!parsedProperty) {
            throw new BeaverError(ErrCodes.propertiesInvalid);
        }

        const propertyKey = parsedProperty[1];
        const resourceMsg = `Resource.msg('${propertyKey}'), '${propertyGroup}', null)`;

        toClipBoard(resourceMsg);
    }
);

export function copyInclude() {
    try {
        const activeTextEditor = vscode.window.activeTextEditor;

        if (!activeTextEditor) {
            throw new BeaverError(ErrCodes.noActiveEditor);
        }

        const filePath = activeTextEditor.document.uri.path;
        const cartridgePath = new ParsedCartridgePath(filePath);
        const fileType = cartridgePath.getFiletype();

        if (fileHandlers.has(fileType)) {
            fileHandlers.get(fileType)(cartridgePath, activeTextEditor);
        } else {
            throw new Error('Unsupported file type');
        }
    } catch (error) {
        let errorMessage;

        if (error instanceof BeaverError) {
            errorMessage = error.printError();
        } else {
            errorMessage = BeaverError.getMessageFor(ErrCodes.unknownError);
        }

        vscode.window.showErrorMessage(errorMessage);
    }
}
