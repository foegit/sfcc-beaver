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
import BEControllerFileCreator from './implementation/FileCreators/BEControllerFileCreator';

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
            case '.js': return FileOverriderFactory.getScriptFileOverrider(activeEditor, sfccProject);
            default: return new FileOverrider(activeEditor, sfccProject, new StaticFileCreator('// overridden'), new StaticFileAppender('\n// overridden'));
        }
    }

    private static getScriptFileOverrider(activeEditor: TextEditor, sfccProject: SFCCProject) {
        const {
            hasFolderInPath
        } = FileOverriderFactory;

        const activeFile = activeEditor.document.uri.fsPath;

        if (hasFolderInPath(activeFile, 'controllers')) {
            return new FileOverrider(activeEditor, sfccProject, new BEControllerFileCreator(), new StaticFileAppender());
        } else if (hasFolderInPath(activeFile, 'client')
            || hasFolderInPath(activeFile, 'config')
            || hasFolderInPath(activeFile, 'experience')
        ) {
            return new FileOverrider(activeEditor, sfccProject, new CopyFileCreator(), new StaticFileAppender());
        } else if (hasFolderInPath(activeFile, 'experience')) {
            return new FileOverrider(activeEditor, sfccProject, new CopyFileCreator(), new StaticFileAppender());
        } else {
            return new FileOverrider(activeEditor, sfccProject, new BEScriptFileCreator(), new StaticFileAppender());
        }
    }

    private static isControllerPath(filePath: string) {
        return FileOverriderFactory.hasFolderInPath(filePath, 'controllers');
    }

    private static isClientPath(filePath: string) {
        return FileOverriderFactory.hasFolderInPath(filePath, 'client');
    }

    private static isConfigPath(filePath: string) {
        return FileOverriderFactory.hasFolderInPath(filePath, 'config');
    }

    private static hasFolderInPath(filePath: string, folder: string) {
        return filePath.includes(`${path.sep}${folder}${path.sep}`);
    }
}