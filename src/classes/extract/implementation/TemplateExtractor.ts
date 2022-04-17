import SFCCProjectFile from '../../SFCCProjectFile';
import IFileExtractor from '../IFileExtractor';

export default class TemplateExtractor implements IFileExtractor {
    getSnippet(sfccFile: SFCCProjectFile) : string{
        const templatePath = sfccFile.getSFCCPath();

        if (templatePath === '') {
            // TODO add beaver error
            throw new Error('Template is not recognized');
        }

        const templateIsinclude = `<isinclude template="${templatePath}" />`;

        return templateIsinclude;
    }
}