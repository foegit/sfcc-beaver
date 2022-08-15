export default class DocumentationViewer {
    static init(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.commands.registerCommand('sfccBeaver.openDocs', () => {
                CatCodingPanel.createOrShow(context.extensionUri);
            })
        );

        if (vscode.window.registerWebviewPanelSerializer) {
            // Make sure we register a serializer in activation event
            vscode.window.registerWebviewPanelSerializer(CatCodingPanel.viewType, {
                async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                    console.log(`Got state: ${state}`);
                    // Reset the webview options so we use latest uri for `localResourceRoots`.
                    webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
                    CatCodingPanel.revive(webviewPanel, context.extensionUri);
                }
            });
        }
    }
}

import * as vscode from 'vscode';
import axios from 'axios';

/**
 * Manages cat coding webview panels
 */
class CatCodingPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: CatCodingPanel | undefined;

    public static readonly viewType = 'catCoding';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (CatCodingPanel.currentPanel) {
            CatCodingPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            CatCodingPanel.viewType,
            'Cat Coding',
            column || vscode.ViewColumn.One,
            getWebviewOptions(extensionUri),
        );

        CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;


        this._panel.title = '🦫 SFCC Docs';
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

        // Set the webview's initial html content

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(
            e => {
                if (this._panel.visible) {
                    console.log('CHANGED');
                }
            },
            null,
            this._disposables
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                    case 'search': {

                        const res = await axios.get(`https://documentation.b2c.commercecloud.salesforce.com/DOC2/advanced/searchView.jsp?searchWord=${message.text}&maxHits=500`);

                        const a = 1;

                        this._panel.webview.postMessage({ command: 'updateResults', data: res.data });
                    }
                }
            },
            null,
            this._disposables
        );
    }

    public doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }

    public dispose() {
        CatCodingPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'static', 'docs', 'main.js');

        // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

        // Local path to css styles
            const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'static', 'docs', 'reset.css');
            const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'static', 'docs', 'vscode.css');

        // Uri to load styles into webview
        const stylesResetUri = webview.asWebviewUri(styleResetPath);
        const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">

                <!--
                    Use a content security policy to only allow loading images from https or from our extension directory,
                    and only allow scripts that have a specific nonce.
                -->

                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <link href="${stylesResetUri}" rel="stylesheet">
                <link href="${stylesMainUri}" rel="stylesheet">

                <title>Cat Coding</title>
            </head>
            <body>

                <input class="bv-doc-search-input" type="search"/>
                <button class="bv-doc-search-btn">Search</button>

                <h1>Result</h1>

                <main>
                    <div class="side-panel"><p class="bv-search-results"></p></div>
                    <div class="preview"></div>
                </main>


                <script nonce="${nonce}" src="${scriptUri}"></script>


            </body>
            </html>`;
    }
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'static', 'docs')]
    };
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
