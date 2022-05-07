import { TextEditor, window } from 'vscode';
import IFileCreator from '../../IFileCreator';
import { controller } from '../../snippets/controller';

export default class BEControllerFileCreator implements IFileCreator {
    create(activeEditor: TextEditor): string {
        let snippetCopy = controller;

        const focusedController = this.getFocusedController(activeEditor);

        if (!focusedController) {
            return this.replaceEndpointName(snippetCopy, 'foo');
        }

        return this.replaceEndpointName(snippetCopy, focusedController);;
    }

    protected getAppendSnippet(): string {
        window.showInformationMessage('🦫 Someone has overwritten it. Strange...');
        return '';
    }

    private replaceEndpointName(snippet: string, endpoint: string): string {
        return snippet.replace('{endpoint}', endpoint);
    }

    private getFocusedController(activeEditor : TextEditor): string {
        const ae = activeEditor;
        const doc = ae.document;
        const selectedLine = ae.selection.active.line;

        if (!selectedLine) {
            return '';
        }

        const searchRange = [
            selectedLine !== 0 ? doc.lineAt(selectedLine - 1).text : '', // prev line
            doc.lineAt(selectedLine).text,
            selectedLine + 1 > doc.lineCount ? doc.lineAt(selectedLine + 1).text : '' // next line
        ].join('\n');

        const endpointRegExp = /server[\s\S]*\.(?:get|post|append|prepend|replace)[\s\S]*\([\s\S]*['"]([\w\d]*)['"].*$/gm;

        if (!selectedLine) {
            return '';
        }

        const parsedLine = endpointRegExp.exec(searchRange);

        return parsedLine ? parsedLine[1] : '';
    }
}