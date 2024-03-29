import path = require('path');
import PathTool from './tools/PathTool';

export default class SFCCProjectFile {
    path : string;
    cartridgeRelativePath : string = '';
    inCartridge : boolean = false;
    inModules : boolean = false;
    extension : string = '';
    fileName : string = '';
    fileType : string = '';

    constructor (path : string) {
        this.path = path;

        this.parse();
    }

    private parse() {
        const parsedPath = path.parse(this.path);

        this.extension = parsedPath.ext;
        this.fileName = parsedPath.name;
        this.fileType = this.extension;

        const cartridgeIndex = PathTool.indexOfFolder(this.path, 'cartridge');
        const modulesIndex = PathTool.indexOfFolder(this.path, 'modules');

        this.inCartridge = cartridgeIndex !== -1;
        this.inModules = modulesIndex !== -1;

        if (this.inCartridge) {
            this.cartridgeRelativePath = this.path.slice(cartridgeIndex).replace(this.extension, '');
        } else if (this.inModules) {
            this.cartridgeRelativePath = this.path.slice(modulesIndex + 9).replace(this.extension, '');
        }
    }

    public getCartridgeRelativePath(addExtension? : boolean) {
        if (addExtension) {
            return this.cartridgeRelativePath + this.extension;
        }

        return this.cartridgeRelativePath;
    }

    public getSFCCPath() : string {
        if (['.js', '.json', '.ds', ''].includes(this.fileType)) {
            // return general path for scripts and json
            return this.getCartridgeRelativePath();
        }

        if (this.fileType === '.isml') {
            // return a relative to templates folder path ignoring locale folder
            const templatePathParseResult = /^.*\/templates\/[^\/]*\/(.*)\.isml$/.exec(this.path);

            return templatePathParseResult ? templatePathParseResult[1] : '';
        }

        if (this.fileType === '.properties') {
            // return a name of the group
            const propertiesPathParseResult = /^.*[\/\\](.*)\.properties$/.exec(this.path);

            if (!propertiesPathParseResult) {
                return 'unknown';
            }

            return propertiesPathParseResult[1].replace(/_.*$/, ''); // replaces locale if needed
        }

        return '';
    }
}
