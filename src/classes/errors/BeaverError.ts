/* eslint-disable quotes */
import ErrorMeta from './ErrorMeta';

export enum ErrCodes {
  unknownError = 0,
  noActiveEditor = 1,
  propertiesEmptyLine = 3,
  propertiesInvalid = 4,
  unknownFileType = 5,
  overriddenFileIsFolder = 6,
  cartridgeIsUnknown = 7,
  modulesOverride = 8,
  notInCartridgeOverride = 9,
}

const errorsMeta: Record<ErrCodes, ErrorMeta> = {
  [ErrCodes.unknownError]: new ErrorMeta('I did not expect this to happened. Can you try again?'),
  [ErrCodes.noActiveEditor]: new ErrorMeta('I need an open file to do this'),
  [ErrCodes.propertiesEmptyLine]: new ErrorMeta("Hey, you're on an empty line. Move on"),
  [ErrCodes.propertiesInvalid]: new ErrorMeta('Is it just me or this property looks shady?'),
  [ErrCodes.unknownFileType]: new ErrorMeta("It doesn't look like a job for me"),
  [ErrCodes.overriddenFileIsFolder]: new ErrorMeta('Oh my... There is folder named the same as this file'),
  [ErrCodes.cartridgeIsUnknown]: new ErrorMeta("I don't know this cartridge: {0}"),
  [ErrCodes.modulesOverride]: new ErrorMeta("Whoa, this is modules cartridge files can't be overridden for it"),
  [ErrCodes.notInCartridgeOverride]: new ErrorMeta('Only files in cartridge can be overridden'),
};

export default class BeaverError extends Error {
  params: (string | number)[] = [];

  static getMessageFor(errCode: ErrCodes, ...params: Array<string | number>): string {
    if (errorsMeta[errCode]) {
      return errorsMeta[errCode].bMessage.replace(/\{(\w+)\}/, (all: string, num: string) => {
        return String(params[Number(num)] || '<missing>');
      });
    }

    return errorsMeta[ErrCodes.unknownError].bMessage;
  }

  errCode: ErrCodes;

  constructor(errCode: ErrCodes, ...params: Array<string | number>) {
    super(errCode.toString());
    if (params) {
      this.params = params;
    }

    this.errCode = errCode;
  }

  printError(): string {
    return BeaverError.getMessageFor(this.errCode, ...this.params);
  }
}
