import FileExtractorFactory from '../classes/override/FileOverriderFactory';
import { window } from 'vscode';
import BeaverError, { ErrCodes } from '../classes/errors/BeaverError';
import { handleError } from './error';
import SFCCProject from '../classes/SFCCProject';

const sfccProject = new SFCCProject();

export async function overrideFile() {
    try {
        const activeTextEditor = window.activeTextEditor;

        if (activeTextEditor) {
            const overrider = FileExtractorFactory.get('script', activeTextEditor, sfccProject);

            await overrider.override();
        } else {
            if (!activeTextEditor) {
                throw new BeaverError(ErrCodes.noActiveEditor);
            }
        }
    } catch (error) {
        handleError(error);
    }
}