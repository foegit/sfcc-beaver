import { TextEditor, window } from 'vscode';
import IFileCreator from '../../IFileCreator';
import { controller } from '../../snippets/controller';

export default class BEControllerFileCreator implements IFileCreator {
    create(activeEditor: TextEditor): string {
        let snippetCopy = controller;

        const focusedFunction = this.getFocusedController(activeEditor);

        if (!focusedFunction) {
            return this.replaceEndpointName(snippetCopy, 'foo');
        }

        return this.replaceEndpointName(snippetCopy, focusedFunction);;
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
        const selectedLine = doc.lineAt(ae.selection.active.line);

        if (!selectedLine) {
            return '';
        }

        const parsedLine = /^function\s*(\w*).*$/.exec(selectedLine.text);

        return parsedLine ? parsedLine[1] : '';
    }
}