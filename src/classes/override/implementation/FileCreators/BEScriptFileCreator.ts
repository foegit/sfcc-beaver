import { TextEditor, window } from 'vscode';
import IFileCreator from '../../IFileCreator';
import { snippet } from '../../snippets/script';

export default class BEScriptFileCreator implements IFileCreator {
    create(activeEditor: TextEditor): string {
        let snippetCopy = snippet;

        const focusedFunction = this.getFocusedFunction(activeEditor);

        if (!focusedFunction) {
            return this.replaceFunctionName(snippetCopy, 'foo');
        }

        return this.replaceFunctionName(snippetCopy, focusedFunction);;
    }

    protected getAppendSnippet(): string {
        window.showInformationMessage('🦫 Someone has overriden it. Is it suspicious?...');
        return '';
    }

    private replaceFunctionName(snippet: string, fName: string): string {
        return snippet.replace(/\{fName\}/g, fName);
    }

    private replaceComment(snippet: string, comment: string): string {
        return snippet.replace('{comment}', comment);
    }

    private getFocusedFunction(activeEditor : TextEditor): string {
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