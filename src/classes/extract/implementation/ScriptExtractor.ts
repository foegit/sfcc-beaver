import SFCCProjectFile from '../../SFCCProjectFile';
import IFileExtractor from '../IFileExtractor';

export default class ScriptExtractor implements IFileExtractor {
    getSnippet(sfccFile: SFCCProjectFile) : string {
        const scriptRequire = `var ${sfccFile.fileName} = require('${sfccFile.inCartridge ? '*' : ''}${sfccFile.getSFCCPath()}');`;

        return scriptRequire;
    }
}