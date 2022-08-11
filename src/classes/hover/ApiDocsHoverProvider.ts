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
        const regExp = /require\((['"])\w+\/\w+\/\w+(['"])\)/g;
        const text = this.activeEditor.document.getText();
        const hovers: vscode.DecorationOptions[] = [];
        let match;

        while ((match = regExp.exec(text))) {
            const classRequire = match[0];

            const startPos = this.activeEditor.document.positionAt(match.index + 9);

            const endPos = this.activeEditor.document.positionAt(match.index + match[0].length - 2);

            const commentCommandUri = vscode.Uri.parse('command:sfccBeaver.extract');
            const message = new vscode.MarkdownString(`[boom](${commentCommandUri}) URL utility class. Methods in this class generate URLs used in Commerce Cloud Digital.\n\n[🦫 Open Documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_web_URLUtils.html)`);
            message.isTrusted = true;

            const decoration = {
                    range: new vscode.Range(startPos, endPos),
                    hoverMessage: message
                };
            hovers.push(decoration);
        }
        this.activeEditor.setDecorations(DeclarationStyles.apiClassDecoration, hovers);
    }

    triggerUpdateDecorations(throttle = false) {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        if (throttle) {
            this.timeout = setTimeout(this.updateDecorations.bind(this), 500);
        } else {
            this.updateDecorations();
        }
    }
}
