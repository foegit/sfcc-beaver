import IFileExtractor from './IFileExtractor';
import ResourceExtractor from './implementation/ResourceExtractor';
import ScriptExtractor from './implementation/ScriptExtractor';
import TemplateExtractor from './implementation/TemplateExtractor';
import UnixPathExtractor from './implementation/UnixPathExtractor';

export default class FileExtractorFactory {
    static getHandler(type: string) : IFileExtractor {
        switch (type) {
            case '.js':
            case '.json':
            case '.ds':
                return new ScriptExtractor();
            case '.isml': return new TemplateExtractor();
            case '.properties': return new ResourceExtractor();
            case 'unix': return new UnixPathExtractor();

            default: return new UnixPathExtractor();
        }
    }
}