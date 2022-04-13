import BeaverError, { ErrCodes } from '../../errors/BeaverError';

import IFileExtractor from '../IFileExtractor';

export default class UnknownFileExtractor implements IFileExtractor {
    getSnippet() : string{
        throw new BeaverError(ErrCodes.unknownFileType);
    }
}