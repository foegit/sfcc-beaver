export default class SFCCFile {
    /**
     * d:/work/app_custom/cartridge/scripts/helpers.js
     * 0 - whole match `d:/work/app_custom/cartridge/scripts/helpers.js`
     * 1 - cartridge name - `app_custom`
     * 2 - related path `scripts/helpers.js`
     * 3 - file full name `helpers.js`
     * 4 - file name only `helpers`
     * 5 - extension only `js`
    */
    static cartridgePathRegExp = /^.*\/(.*)\/(cartridge\/.*\/((.*)\.(.*)))$/;
    static relatedPathPosition = 2; // extension only `js`
    static fileNamePosition = 4; // extension only `js`
    static extensionPosition = 5; // extension only `js`

    /**
     * d:/work/app_custom/cartridge/templates/default/components/home.isml
     * 0 - whole match `d:/work/app_custom/cartridge/templates/default/components/home.isml`
     * 1 - template path `components/home`
     */
    static templatePathRegExp = /^.*\/templates\/[^\/]*\/(.*)\.isml$/;
    static templatePathPosition = 1;

    /**
     * d:/work/app_custom/cartridge/templates/resources/address_en_GB.properties
     * 0 - whole match `d:/work/app_custom/cartridge/templates/resources/address_en_GB.properties`
     * 1 - properties group path `address`
     */
    static propertiesPathRegExp = /^.*\/templates\/resources\/([^\_]*).*\.properties$/;
    static propertiesPath = 1;

    private parsedPath : RegExpExecArray;

    constructor(path: string) {
        const parsed = SFCCFile.cartridgePathRegExp.exec(path);

        if (parsed === null || parsed.length < 6) {
            throw new Error('Can not parse path');
        }

        this.parsedPath = parsed;
    }

    getRelatedPath(cutExtension? : boolean) : string {
        const relatedPath = this.parsedPath[SFCCFile.relatedPathPosition];

        if (cutExtension) {
            const extension = this.getExtension();
            const regExp = new RegExp(`\.${extension}$`);

            return relatedPath.replace(regExp, '');
        }

        return this.parsedPath[SFCCFile.relatedPathPosition];
    }

    getFileName() : string {
        return this.parsedPath[SFCCFile.fileNamePosition];
    }

    getFiletype() : string {
        return this.parsedPath[SFCCFile.extensionPosition];
    }

    getExtension() : string {
        return this.parsedPath[SFCCFile.extensionPosition];
    }

    getTemplatePath() : string {
        const relatedPath = this.getRelatedPath();
        const templateParsedPath = SFCCFile.templatePathRegExp.exec(relatedPath);

        return templateParsedPath ? templateParsedPath[SFCCFile.templatePathPosition] : '';
    }

    getPropertiesGroup() : string {
        const relatedPath = this.getRelatedPath();
        const propertiesParsedPath = SFCCFile.propertiesPathRegExp.exec(relatedPath);

        return propertiesParsedPath ? propertiesParsedPath[SFCCFile.templatePathPosition] : '';
    }
}