import * as vscode from 'vscode';
import BeaverError, { ErrCodes } from '../classes/errors/BeaverError';
import SFCCFile from '../classes/../classes/SFCCFile';
import FileExtractorFactory from '../classes/extract/FileExtractorFactory';
import Clipboard from '../classes/Clipboard';

const fileHandlers = new Map();

function toClipBoard(snippet: string) {
    vscode.env.clipboard.writeText(snippet);
    vscode.window.showInformationMessage(`🦫 Copied!\n${snippet}`);
}

export function copyInclude() {
    try {
        const activeTextEditor = vscode.window.activeTextEditor;

        if (!activeTextEditor) {
            throw new BeaverError(ErrCodes.noActiveEditor);
        }

        const filePath = activeTextEditor.document.uri.path;
        const sfccFile = new SFCCFile(filePath);
        const fileType = sfccFile.getFiletype();

        const snippet = FileExtractorFactory.getHandler(fileType).getSnippet(sfccFile, activeTextEditor);

        Clipboard.toClipboard(snippet);
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
