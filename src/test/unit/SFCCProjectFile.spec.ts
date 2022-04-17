import { expect } from 'chai';
import SFCCProjectFile from '../../classes/SFCCProjectFile';

describe('SFCC Project File Tests', () => {
    const templateFile = new SFCCProjectFile('d:/work/app_custom/cartridge/templates/default/components/home.isml');
    const scriptFile = new SFCCProjectFile('d:/work/app_custom/cartridge/scripts/helpers.js');
    const propFile = new SFCCProjectFile('d:/work/app_custom/cartridge/templates/resources/address_en_GB.properties');
    const projectFile = new SFCCProjectFile('d:/work/app_custom/.project');

    it('Cartridge detection', () => {
        expect(templateFile.inCartridge).to.be.true;
        expect(projectFile.inCartridge).to.be.false;
    });

    it('Relative path', () => {
        expect(templateFile.getCartridgeRelativePath(true)).equals('cartridge/templates/default/components/home.isml');
        expect(templateFile.getCartridgeRelativePath()).equals('cartridge/templates/default/components/home');
        expect(scriptFile.getCartridgeRelativePath()).equals('cartridge/scripts/helpers');
        expect(projectFile.getCartridgeRelativePath()).to.be.empty;
    });

    it('Extension', () => {
        expect(templateFile.extension).equals('.isml');
        expect(projectFile.extension).equals(''); // .project has no extension
    });

    it('File Name', () => {
        expect(templateFile.fileName).equals('home');
        expect(projectFile.fileName).equals('.project');
        expect(scriptFile.fileName).equals('helpers');
    });

    it('SFCC Relative Path', () => {
        expect(templateFile.getSFCCPath()).equals('components/home');
        expect(scriptFile.getSFCCPath()).equals('cartridge/scripts/helpers');
        expect(propFile.getSFCCPath()).equals('address');
        expect(projectFile.getSFCCPath()).equals('');
    });
});
