import { TextEditor } from 'vscode';
import IFileCreator from '../../IFileCreator';

export default class CopyFileCreator implements IFileCreator {
    create(activeEditor: TextEditor): string {
        return activeEditor.document.getText();
    }
}