import * as vscode from 'vscode';
import DocsViewerProvider from '../../webviewProviders/DocsViewerProvider';
import DeclarationStyles from './DeclarationStyles';


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

        context.subscriptions.push(
            vscode.commands.registerCommand('sfccBeaver.openClassDetails', (data) => {
                const classPath = /require\(['"](.*)['"]\)/.exec(data);

                DocsViewerProvider.openClassDoc(context.extensionUri, classPath ? classPath[1] : 'dw');
            })
        );
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
            const range = new vscode.Range(startPos, endPos);

            const encodedArgs = encodeURIComponent(JSON.stringify([ classRequire]));
            const commentCommandUri = vscode.Uri.parse('command:sfccBeaver.openClassDetails?' + encodedArgs);
            const hoverMessage = new vscode.MarkdownString(`[🦫 Open Docs](${commentCommandUri})`);

            hoverMessage.isTrusted = true;

            hovers.push({ range, hoverMessage });
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
