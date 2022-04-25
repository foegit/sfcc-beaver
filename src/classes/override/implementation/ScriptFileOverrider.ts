import { snippet } from '../snippets/script';
import FileOverrider from './FileOverrider';

// TODO: define desired logic for script files

class ScriptFileOverrider extends FileOverrider {
    protected getNewFileSnippet(): string {
        let snippetCopy = snippet;

        const focusedFunction = this.getFocusedFunction();

        if (!focusedFunction) {
            return this.replaceFunctionName(snippetCopy, 'foo');
        }

        return this.replaceFunctionName(snippetCopy, focusedFunction);;
    }

    private replaceFunctionName(snippet: string, fName: string): string {
        return snippet.replace(/\{fName\}/g, fName);
    }

    private replaceComment(snippet: string, comment: string): string {
        return snippet.replace('{comment}', comment);
    }

    private getFocusedFunction(): string {
        const ae = this.activeEditor;
        const doc = ae.document;
        const selectedLine = doc.lineAt(ae.selection.active.line);

        if (!selectedLine) {
            return '';
        }

        const parsedLine = /^function\s*(\w*).*$/.exec(selectedLine.text);

        return parsedLine ? parsedLine[1] : '';
    }
}

export default ScriptFileOverrider;
