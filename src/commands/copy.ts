import * as vscode from 'vscode';
import BeaverError, { ErrCodes } from '../classes/errors/BeaverError';
import FileExtractorFactory from '../classes/extract/FileExtractorFactory';
import { handleError } from './error';
import SFCCProjectFile from '../classes/SFCCProjectFile';
import { copyToClipboard } from '../helpers/clipboard';

export function copyInclude() {
    try {
        const activeTextEditor = vscode.window.activeTextEditor;

        if (!activeTextEditor) {
            throw new BeaverError(ErrCodes.noActiveEditor);
        }

        const filePath = activeTextEditor.document.uri.path;
        const sfccFile = new SFCCProjectFile(filePath);

        const snippet = FileExtractorFactory.getHandler(sfccFile.extension).getSnippet(sfccFile, activeTextEditor);

        copyToClipboard(snippet);
    } catch (error) {
        handleError(error);
    }
}

export function copyUnixPath() {
    try {
        const activeTextEditor = vscode.window.activeTextEditor;

        if (!activeTextEditor) {
            throw new BeaverError(ErrCodes.noActiveEditor);
        }

        const filePath = activeTextEditor.document.uri.path;
        const sfccFile = new SFCCProjectFile(filePath);

        const snippet = FileExtractorFactory.getHandler('unix').getSnippet(sfccFile, activeTextEditor);

        copyToClipboard(snippet);
    } catch (error) {
        handleError(error);
    }
}
