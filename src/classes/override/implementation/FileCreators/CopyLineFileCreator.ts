import { TextEditor } from 'vscode';
import IFileCreator from '../../IFileCreator';

export default class CopyLineFileCreator implements IFileCreator {
    create(activeEditor: TextEditor): string {
        const activeFile = activeEditor.document;
        const selectedLine = activeEditor.selection.active.line;

        const selectedLineText = activeFile.lineAt(selectedLine).text;

        return selectedLineText;
    }
}