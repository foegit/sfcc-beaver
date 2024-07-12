import PathTool from './PathTool';
import { TextDocumentShowOptions, Uri, window, workspace } from 'vscode';
import FsTool from './FsTool';

export default class EditorTool {
    static async focusOnWorkspaceFile(relativePath: string, options: TextDocumentShowOptions = {}) {
        const folder = FsTool.getCurrentWorkspaceFolder();
        const absPath = PathTool.getAbsPosixPath(folder, relativePath);

        return EditorTool.focusOnFile(absPath, options);
    }

    static async focusOnFile(absFilePath: string, options: TextDocumentShowOptions = {}) {
        const fileUri = Uri.file(absFilePath);

        const textDocument = await workspace.openTextDocument(fileUri);
        await window.showTextDocument(textDocument, options);

        return textDocument;
    }
}
