import ErrorMeta from './ErrorMeta';

export enum ErrCodes {
    unknownError = 0,
    noActiveEditor = 1,
    propertiesEmptyLine = 3,
    propertiesInvalid = 4,
    unknownFileType = 5,
    overriddenFileIsFolder = 6,
    cartridgeIsUnknown = 7
};

const errorsMeta : Record<ErrCodes, ErrorMeta> = {
    [ErrCodes.unknownError]: new ErrorMeta('I don\'t know what happened. Did you restart your computer?'),
    [ErrCodes.noActiveEditor]: new ErrorMeta('Dude, open something! I won\'t do anything before it.'),
    [ErrCodes.propertiesEmptyLine]: new ErrorMeta('Hey, you\'re on an empty line. Move on'),
    [ErrCodes.propertiesInvalid]: new ErrorMeta('Is it just me or this property looks shady?'),
    [ErrCodes.unknownFileType]: new ErrorMeta('It doesn\'t look like a job for me'),
    [ErrCodes.overriddenFileIsFolder]: new ErrorMeta('Oh my... There is folder named the same as this file'),
    [ErrCodes.cartridgeIsUnknown]: new ErrorMeta('I don\'t know this cartridge: {0}')
};

export default class BeaverError extends Error {
    params: (string | number)[] = [];

    static getMessageFor(errCode: ErrCodes, ...params: Array<string|number>) : string {
        if (errorsMeta[errCode]) {
            return errorsMeta[errCode].bMessage.replace(/\{(\w+)\}/, (all : string, num : string) => {
                return String(params[Number(num)] || '<missing>');
            });
        }

        return errorsMeta[ErrCodes.unknownError].bMessage;
    }

    errCode : ErrCodes;

    constructor (errCode: ErrCodes, ...params: Array<string|number>) {
        super(errCode.toString());
        if (params) {
            this.params = params;
        }

        this.errCode = errCode;
    }

    printError() : string {
        return BeaverError.getMessageFor(this.errCode, ...this.params);
    }
}