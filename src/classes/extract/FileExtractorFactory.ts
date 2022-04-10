import IFileExtractor from "./IFileExtractor";
import ResourceExtractor from "./implementation/ResourceExtractor";
import ScriptExtractor from "./implementation/ScriptExtractor";
import TemplateExtractor from "./implementation/TemplateExtractor";
import UnknownFileExtractor from "./implementation/UnknownTypeExtractor";

export default class FileExtractorFactory {
    static getHandler(fileType : string) : IFileExtractor {
        switch (fileType) {
            case 'js': return new ScriptExtractor();
            case 'isml': return new TemplateExtractor();
            case 'properties': return new ResourceExtractor();

            default: return new UnknownFileExtractor();
        }
    }
}