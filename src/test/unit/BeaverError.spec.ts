import { expect } from 'chai';
import BeaverError, { ErrCodes } from '../../classes/errors/BeaverError';

describe('Beaver Error', () => {
    it('Format works good', () => {
        const beaverErrorEmpty = new BeaverError(ErrCodes.cartridgeIsUnknown);
        const beaverError = new BeaverError(ErrCodes.cartridgeIsUnknown, 'app_custom');

        expect(beaverErrorEmpty.printError()).equal('🦫 I don\'t know this cartridge: <missing>');
        expect(beaverError.printError()).equal('🦫 I don\'t know this cartridge: app_custom');
    });
});