import { TextEditor } from 'vscode';
import * as path from 'path';
import SFCCProject from '../SFCCProject';
import FileOverrider from './implementation/FileOverrider';
import TemplateOverrider from './implementation/TemplateOverrider';
import ResourceOverrider from './implementation/ResourceOverrider';

export default class FileOverriderFactory {
    static get(activeEditor : TextEditor, sfccProject : SFCCProject) : FileOverrider {
        const activeFilePath = activeEditor.document.uri.fsPath;
        const extension = path.parse(activeFilePath).ext;

        switch (extension) {
            case '.isml': return new TemplateOverrider(activeEditor, sfccProject);
            case '.properties': return new ResourceOverrider(activeEditor, sfccProject);
            default: return new FileOverrider(activeEditor, sfccProject);
        }
    }
}