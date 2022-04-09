import ErrorMeta from "./ErrorMeta";

export enum ErrCodes {
    unknownError = 0,
    noActiveEditor = 1,
    propertiesEmptyLine = 3,
    propertiesInvalid = 4,
};

const errorsMeta : Record<ErrCodes, ErrorMeta> = {
    [ErrCodes.unknownError]: new ErrorMeta('I don\'t what happened. Did you restart your computer?'),
    [ErrCodes.noActiveEditor]: new ErrorMeta('Dude, open something! I won\'t do anything before it.'),
    [ErrCodes.propertiesEmptyLine]: new ErrorMeta('Hey, you\'re on an empty line. Move on'),
    [ErrCodes.propertiesInvalid]: new ErrorMeta('Is it just me or this property look sick?')
};

export default class BeaverError extends Error {
    static getMessageFor(errCode: ErrCodes) : string {
        if (errorsMeta[errCode]) {
            return errorsMeta[errCode].bMessage;
        }

        return errorsMeta[ErrCodes.unknownError].bMessage;
    }

    errCode : ErrCodes;

    constructor (errCode : ErrCodes) {
        super(errCode.toString());
        this.errCode = errCode;
    }

    printError() : string {
        return BeaverError.getMessageFor(this.errCode);
    }
}