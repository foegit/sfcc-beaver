import { snippet } from './snippets/script';
import FileOverrider from './FileOverrider';

class ScriptFileOverrider extends FileOverrider {
    protected getNewFileSnippet(): string {
        const script = snippet;

        return script;
    }

    private isFocusedOnFunction() {

    }
}

export default ScriptFileOverrider;
