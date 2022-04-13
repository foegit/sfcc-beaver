import { window } from 'vscode';
import BeaverError, { ErrCodes } from '../classes/errors/BeaverError';

export function handleError(error : any) {
    let errorMessage;

    if (error instanceof BeaverError) {
        errorMessage = error.printError();
    } else {
        errorMessage = BeaverError.getMessageFor(ErrCodes.unknownError);
    }

    console.error(error.message, error.stack);

    window.showErrorMessage(errorMessage);
}