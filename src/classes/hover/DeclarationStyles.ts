import * as vscode from 'vscode';

export default class DeclarationStyles {
    static apiClassDecoration = vscode.window.createTextEditorDecorationType({
        textDecoration: 'underline',
        fontWeight: 'bold',
    });
}
