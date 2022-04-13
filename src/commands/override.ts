import FileExtractorFactory from '../classes/override/FileOverriderFactory';
import { window } from 'vscode';
import BeaverError, { ErrCodes } from '../classes/errors/BeaverError';
import { handleError } from './error';

export function overrideFile() {
    try {
        const activeTextEditor = window.activeTextEditor;

        if (activeTextEditor) {
            const overrider = FileExtractorFactory.get('any');

            overrider.override(activeTextEditor);
        } else {
            if (!activeTextEditor) {
                throw new BeaverError(ErrCodes.noActiveEditor);
            }
        }
    } catch (error) {
        handleError(error);
    }
}