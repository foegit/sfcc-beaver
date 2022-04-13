import { TextEditor } from 'vscode';
import BeaverError, { ErrCodes } from '../../errors/BeaverError';
import SFCCFile from '../../SFCCFile';
import IFileExtractor from '../IFileExtractor';

export default class ResourceExtractor implements IFileExtractor {
    getSnippet(sfccFile: SFCCFile, activeEditor: TextEditor): string {
        const propertyGroup = sfccFile.getPropertiesGroup();

        const { text } = activeEditor.document.lineAt(activeEditor.selection.active.line);
        const selectedLineContent = text.trim();

        if (!selectedLineContent) {
            throw new BeaverError(ErrCodes.propertiesEmptyLine);
        }

        const propertyRegExp = /^([^#]+)=.*$/;
        const parsedProperty = propertyRegExp.exec(selectedLineContent);

        if (!parsedProperty) {
            throw new BeaverError(ErrCodes.propertiesInvalid);
        }

        const propertyKey = parsedProperty[1];
        const formattedProp = this.getResourceWithPlaceHolder(selectedLineContent, propertyKey, propertyGroup);


        if (formattedProp) {
            return formattedProp;
        }

        const resourceMsg = `Resource.msg('${propertyKey}'), '${propertyGroup}', null)`;

        return resourceMsg;
    }

    getResourceWithPlaceHolder(selectedLineContent : string, key: string, group: string) {
        const placeHolderRegExp = /({\w+})/g;
        const placeholders = selectedLineContent.match(placeHolderRegExp);

        if (placeholders?.length) {
            const uniqueOnly = [...new Set(placeholders)];

            const uniqueOnly2 = uniqueOnly.map(placeholder => `'$${placeholder}'`);

            const result = `Resource.msgf('${key}', '${group}', null, ${uniqueOnly2.join(',')})`;

            return result;
        }
    }
}