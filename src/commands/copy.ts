import * as vscode from 'vscode';
import BeaverError, { ErrCodes } from '../classes/errors/BeaverError';
import SFCCFile from '../classes/SFCCFile';
import FileExtractorFactory from '../classes/extract/FileExtractorFactory';
import Clipboard from '../classes/Clipboard';
import { handleError } from './error';

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
        const sfccFile = new SFCCFile(filePath);

        const snippet = FileExtractorFactory.getHandler('any').getSnippet(sfccFile, activeTextEditor);

        Clipboard.toClipboard(snippet);
    } catch (error) {
        handleError(error);
    }
}

