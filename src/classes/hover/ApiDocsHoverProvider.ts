import * as vscode from 'vscode';
import DeclarationStyles from './DeclarationStyles';

// vscode.languages.registerHoverProvider('*', {
//     provideHover(document, position, token) {

//         const range = document.getWordRangeAtPosition(position);
//         const word = document.getText(range);

//         if (word === 'HELLO') {

//             return new vscode.Hover(new vscode.MarkdownString('URL utility class. Methods in this class generate URLs used in Commerce Cloud Digital.\n\n[🦫 Open Documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_web_URLUtils.html)'));
//         }
//     }
// });

export default class ApiDocsHoverProvider {
    private timeout : NodeJS.Timer | undefined;
    private activeEditor : vscode.TextEditor | undefined;

    constructor (context: vscode.ExtensionContext) {
        this.activeEditor = vscode.window.activeTextEditor;
        this.triggerUpdateDecorations();

        vscode.window.onDidChangeActiveTextEditor(editor => {
            this.activeEditor = editor;
            this.triggerUpdateDecorations();
        }, null, context.subscriptions);

        vscode.workspace.onDidChangeTextDocument(event => {
            if (this.activeEditor && event.document === this.activeEditor.document) {
                this.triggerUpdateDecorations(true);
            }
        }, null, context.subscriptions);
    }

    updateDecorations() {
        if (!this.activeEditor) {
            return;
        }
        const regEx = /\d+/g;
        const text = this.activeEditor.document.getText();
        const smallNumbers: vscode.DecorationOptions[] = [];
        let match;
        while ((match = regEx.exec(text))) {
            const startPos = this.activeEditor.document.positionAt(match.index);
            const endPos = this.activeEditor.document.positionAt(match.index + match[0].length);
            const decoration = {
                    range: new vscode.Range(startPos, endPos),
                    hoverMessage: new vscode.MarkdownString('URL utility class. Methods in this class generate URLs used in Commerce Cloud Digital.\n\n[🦫 Open Documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_web_URLUtils.html)')
                };
            smallNumbers.push(decoration);
        }
        this.activeEditor.setDecorations(DeclarationStyles.apiClassDecoration, smallNumbers);
    }

    triggerUpdateDecorations(throttle = false) {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        if (throttle) {
            this.timeout = setTimeout(this.updateDecorations, 500);
        } else {
            this.updateDecorations();
        }
    }
}
