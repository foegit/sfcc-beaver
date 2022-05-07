import * as vscode from 'vscode';
import SFCCProjectFile from '../../SFCCProjectFile';
import IFileExtractor from '../IFileExtractor';

export default class UnixPathExtractor implements IFileExtractor {
    getSnippet(_sfccFile: SFCCProjectFile, activeEditor: vscode.TextEditor) : string{
        const fileFullPath = activeEditor.document.uri.path;

        const openWorkspaces = vscode.workspace.workspaceFolders;

        if (!openWorkspaces || openWorkspaces.length === 0) {
            return fileFullPath;
        }

        const settings = vscode.workspace.getConfiguration('sfccBeaver');

        const projectDirectoryPath = openWorkspaces[0].uri.path;
        const filePathRelatedToRoot = fileFullPath.replace(`${projectDirectoryPath}\/`, '');

        if (settings.addLineNumberForUnix) {
            const selectedLine = activeEditor.selection.active.line;
            return filePathRelatedToRoot + '#' + selectedLine;
        }

        return filePathRelatedToRoot;
    }
}