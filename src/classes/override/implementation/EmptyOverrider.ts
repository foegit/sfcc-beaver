import * as vscode from 'vscode';
import IFileOverrider from '../IFileOverrider';

export default class EmptyOverrider implements IFileOverrider {
    override(activeEditor: vscode.TextEditor) : void {
        vscode.window.showInformationMessage('Empty Override');
    }
}