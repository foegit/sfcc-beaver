import { TextEditor } from 'vscode';
import * as path from 'path';
import SFCCProject from '../SFCCProject';
import FileOverrider from './implementation/FileOverrider';
import StaticFileCreator from './implementation/FileCreators/StaticFileCreator';
import CopyFileCreator from './implementation/FileCreators/CopyFileCreator';
import CopyLineFileCreator from './implementation/FileCreators/CopyLineFileCreator';
import BEScriptFileCreator from './implementation/FileCreators/BEScriptFileCreator';
import StaticFileAppender from './implementation/FileAppenders/StaticFileAppender';
import CopyLineFileAppender from './implementation/FileAppenders/CopyLineFileAppender';

export default class FileOverriderFactory {
    static get(activeEditor : TextEditor, sfccProject : SFCCProject) : FileOverrider {
        const activeFilePath = activeEditor.document.uri.fsPath;
        const extension = path.parse(activeFilePath).ext;

        switch (extension) {
            case '.isml':
            case '.xml':
            case '.json':
                return new FileOverrider(activeEditor, sfccProject, new CopyFileCreator(), new StaticFileAppender());
            case '.properties': return new FileOverrider(activeEditor, sfccProject, new CopyLineFileCreator(), new CopyLineFileAppender());
            case '.js': return new FileOverrider(activeEditor, sfccProject, new BEScriptFileCreator(), new StaticFileAppender());
            default: return new FileOverrider(activeEditor, sfccProject, new StaticFileCreator('// overridden'), new StaticFileAppender('\n// overridden'));
        }
    }
}