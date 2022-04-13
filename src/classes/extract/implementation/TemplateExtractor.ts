import SFCCFile from '../../SFCCFile';
import IFileExtractor from '../IFileExtractor';

export default class TemplateExtractor implements IFileExtractor {
    getSnippet(sfccFile: SFCCFile) : string{
        const templatePath = sfccFile.getTemplatePath();

        if (templatePath === '') {
            // TODO add beaver error
            throw new Error('Template is not recognized');
        }

        const templateIsinclude = `<isinclude template="${templatePath}" />`;

        return templateIsinclude;
    }
}