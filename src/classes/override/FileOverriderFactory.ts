import { TextEditor } from 'vscode';
import SFCCProject from '../SFCCProject';
import FileOverrider from './FileOverrider';
import ScriptFileOverrider from './ScriptFileOverrider';

export default class FileOverriderFactory {
    static get(type : string, activeEditor : TextEditor, sfccProject : SFCCProject) : FileOverrider {
        switch (type) {
            case 'script': return new ScriptFileOverrider(activeEditor, sfccProject);
            default: return new FileOverrider(activeEditor, sfccProject);
        }
    }
}