import SFCCFile from "../SFCCFile";
import IFileExtractor from "./IFileExtractor";
import ResourceExtractor from "./implementation/ResourceExtractor";
import ScriptExtractor from "./implementation/ScriptExtractor";
import TemplateExtractor from "./implementation/TemplateExtractor";
import UnixPathExtractor from "./implementation/UnixPathExtractor";
import UnknownFileExtractor from "./implementation/UnknownTypeExtractor";

export default class FileExtractorFactory {
    static getHandler(handlerType : string) : IFileExtractor {
        switch (handlerType) {
            case SFCCFile.scripFileType:
            case SFCCFile.jsonFileType:
                return new ScriptExtractor();
            case 'isml': return new TemplateExtractor();
            case 'properties': return new ResourceExtractor();
            case 'any': return new UnixPathExtractor();

            default: return new UnknownFileExtractor();
        }
    }
}