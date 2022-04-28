import { TextEditor } from 'vscode';
import IFileAppender from '../../IFileAppender';

export default class CopyLineFileAppender implements IFileAppender {
    append(activeEditor: TextEditor): string {
        const activeFile = activeEditor.document;
        const selectedLine = activeEditor.selection.active.line;

        const selectedLineText = activeFile.lineAt(selectedLine).text;

        return '\n' + selectedLineText;
    }
}