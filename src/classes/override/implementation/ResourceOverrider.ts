import FileOverrider from './FileOverrider';

class ResourceOverrider extends FileOverrider {
    protected getNewFileSnippet(): string {
        const activeFile = this.activeEditor.document;
        const selectedLine = this.activeEditor.selection.active.line;

        const selectedLineText = activeFile.lineAt(selectedLine).text;

        return selectedLineText;
    }

    protected getAppendSnippet(): string {
        return '\n' + this.getNewFileSnippet();
    }
}

export default ResourceOverrider;
