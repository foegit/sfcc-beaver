import * as vscode from 'vscode';

export default class Clipboard {
    static toClipboard(message: string) {
        vscode.env.clipboard.writeText(message);
        vscode.window.showInformationMessage(`🦫 Copied!\n${message}`);
    }
}