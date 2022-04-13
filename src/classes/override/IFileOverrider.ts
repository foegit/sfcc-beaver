import * as vscode from 'vscode';

interface IFileOverrider {
    override(activeEditor : vscode.TextEditor) : void;
};

export default IFileOverrider;
