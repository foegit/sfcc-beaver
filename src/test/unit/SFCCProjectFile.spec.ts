import { expect } from 'chai';
import SFCCProjectFile from '../../classes/SFCCProjectFile';

describe('SFCC Project File Tests', () => {
    const templateFile = new SFCCProjectFile('d:/work/app_custom/cartridge/templates/default/components/home.isml');
    const scriptFile = new SFCCProjectFile('d:/work/app_custom/cartridge/scripts/helpers.js');
    const propFile = new SFCCProjectFile('d:/work/app_custom/cartridge/templates/resources/address_en_GB.properties');
    const projectFile = new SFCCProjectFile('d:/work/app_custom/.project');
    const modulesFile = new SFCCProjectFile('d:/work/modules/server.js');
    const modulesDeepFile = new SFCCProjectFile('d:/work/modules/a/b/c/test.js');

    it('Cartridge detection', () => {
        expect(templateFile.inCartridge).to.be.true;
        expect(templateFile.inModules).to.be.false;
        expect(projectFile.inCartridge).to.be.false;
        expect(modulesFile.inCartridge).to.be.false;
        expect(modulesFile.inModules).to.be.true;
    });

    it('Relative path', () => {
        expect(templateFile.getCartridgeRelativePath(true)).equals('/cartridge/templates/default/components/home.isml');
        expect(templateFile.getCartridgeRelativePath()).equals('/cartridge/templates/default/components/home');
        expect(scriptFile.getCartridgeRelativePath()).equals('/cartridge/scripts/helpers');
        expect(modulesFile.getCartridgeRelativePath()).equals('server');
        expect(modulesDeepFile.getCartridgeRelativePath()).equals('a/b/c/test');
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
        expect(scriptFile.getSFCCPath()).equals('/cartridge/scripts/helpers');
        expect(propFile.getSFCCPath()).equals('address');
        expect(projectFile.getSFCCPath()).equals('');
        expect(modulesFile.getSFCCPath()).equals('server');
        expect(modulesDeepFile.getSFCCPath()).equals('a/b/c/test');
    });
});
