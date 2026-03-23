import FileOverriderFactory from '../classes/override/FileOverriderFactory';
import { window } from 'vscode';
import BeaverError, { ErrCodes } from '../classes/errors/BeaverError';
import { handleError } from './error';
import SFCCProject from '../classes/SFCCProject';

const sfccProject = new SFCCProject();

export async function overrideFile() {
  try {
    const activeTextEditor = window.activeTextEditor;

    if (!activeTextEditor) {
      throw new BeaverError(ErrCodes.noActiveEditor);
    }

    const overrider = FileOverriderFactory.get(activeTextEditor, sfccProject);

    await overrider.override();
  } catch (error) {
    handleError(error);
  }
}
