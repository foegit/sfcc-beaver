import FileExtractorFactory from '../classes/override/FileOverriderFactory';
import { window } from 'vscode';
import BeaverError, { ErrCodes } from '../classes/errors/BeaverError';
import { handleError } from './error';
import SFCCProject from '../classes/SFCCProject';

const sfccProject = new SFCCProject();

export function overrideFile() {
    try {
        const activeTextEditor = window.activeTextEditor;

        if (activeTextEditor) {
            const overrider = FileExtractorFactory.get('any');

            overrider.override(activeTextEditor, sfccProject);
        } else {
            if (!activeTextEditor) {
                throw new BeaverError(ErrCodes.noActiveEditor);
            }
        }
    } catch (error) {
        handleError(error);
    }
}