import { TextEditor } from 'vscode';
import * as path from 'path';
import SFCCProject from '../SFCCProject';
import FileOverrider from './implementation/FileOverrider';
import StaticFileCreator from './implementation/FileCreators/StaticFileCreator';
import CopyFileCreator from './implementation/FileCreators/CopyFileCreator';
import CopyLineFileCreator from './implementation/FileCreators/CopyLineFileCreator';
import BEScriptFileCreator from './implementation/FileCreators/BEScriptFileCreator';
import BEControllerFileCreator from './implementation/FileCreators/BEControllerFileCreator';
import PathTool from '../tools/PathTool';

export default class FileOverriderFactory {
    static get(activeEditor : TextEditor, sfccProject : SFCCProject) : FileOverrider {
        const activeFilePath = activeEditor.document.uri.fsPath;
        const extension = path.parse(activeFilePath).ext;

        switch (extension) {
            case '.isml':
            case '.xml':
            case '.json':
                return new FileOverrider(activeEditor, sfccProject, new CopyFileCreator());
            case '.properties': return new FileOverrider(activeEditor, sfccProject, new CopyLineFileCreator());
            case '.js': return FileOverriderFactory.getScriptFileOverrider(activeEditor, sfccProject);
            default: return new FileOverrider(activeEditor, sfccProject, new StaticFileCreator('// overridden'));
        }
    }

    private static getScriptFileOverrider(activeEditor: TextEditor, sfccProject: SFCCProject) {
        const { hasFolder } = PathTool;

        const activeFile = activeEditor.document.uri.fsPath;

        if (hasFolder(activeFile, 'controllers')) {
            return new FileOverrider(activeEditor, sfccProject, new BEControllerFileCreator());
        }

        if (hasFolder(activeFile, 'client') || hasFolder(activeFile, 'config') || hasFolder(activeFile, 'experience')) {
            return new FileOverrider(activeEditor, sfccProject, new CopyFileCreator());
        }

        if (hasFolder(activeFile, 'experience')) {
            return new FileOverrider(activeEditor, sfccProject, new CopyFileCreator());
        }

        return new FileOverrider(activeEditor, sfccProject, new BEScriptFileCreator());
    }
}