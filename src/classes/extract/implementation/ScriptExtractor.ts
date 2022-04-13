import SFCCFile from '../../SFCCFile';
import IFileExtractor from '../IFileExtractor';

export default class ScriptExtractor implements IFileExtractor {
    getSnippet(sfccFile: SFCCFile) : string{
        const scriptRequire = `var ${sfccFile.getFileName()} = require('*/${sfccFile.getRelatedPath(true)}');`;

        return scriptRequire;
    }
}