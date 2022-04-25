import FileOverrider from './FileOverrider';

class TemplateOverrider extends FileOverrider {
    protected getNewFileSnippet(): string {
        return this.activeEditor.document.getText();
    }

    protected getAppendSnippet(): string {
        return '';
    }
}

export default TemplateOverrider;
