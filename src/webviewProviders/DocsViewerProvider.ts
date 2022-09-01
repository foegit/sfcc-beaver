import * as vscode from 'vscode';
import axios from 'axios';
import normalizeUrl from 'normalize-url';
import WebviewTool from '../classes/tools/WebviewTool';

class PayloadData {
    public relativeLink: string;
    public baseURL: string;

    constructor(url: string) {
        this.relativeLink = url;
        this.baseURL = url;
    }
}

/**
 * Manages cat coding webview panels
 */
export default class DocsViewerProvider {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentDocsViewerPanel: DocsViewerProvider | undefined;

    public static readonly viewType = 'docsViewer';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;

    private readonly _data: PayloadData | undefined;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, data: PayloadData) {
        if (!DocsViewerProvider.currentDocsViewerPanel) {
            DocsViewerProvider.currentDocsViewerPanel = DocsViewerProvider.createDocsViewerPanel(extensionUri);
        } else {
            DocsViewerProvider.currentDocsViewerPanel._panel.reveal(vscode.ViewColumn.Beside);
        }

        const baseURL = data.baseURL || 'https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic';

        const contentUrl = normalizeUrl(`${baseURL}/${data.relativeLink}`);

        DocsViewerProvider.currentDocsViewerPanel.loadDocumentationTopic(contentUrl);
    }

    public static openClassDoc(extensionUri: vscode.Uri, classPath: string) {
        this.createOrShow(extensionUri, {
            baseURL: 'https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api',
            relativeLink: `/class_${classPath.replace(/\//g, '_')}.html`
        });
    }

    public static createDocsViewerPanel(extensionUri: vscode.Uri) {
        const panel = vscode.window.createWebviewPanel(
            DocsViewerProvider.viewType,
            'Docs Viewer',
            vscode.ViewColumn.Beside,
            DocsViewerProvider.getWebviewOptions(extensionUri),
        );

        return new DocsViewerProvider(panel, extensionUri);
    }

    async loadDocumentationTopic(topicURL: string) {

        const content = await axios.get(topicURL);


        this._panel.webview.html = content.data;
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        DocsViewerProvider.currentDocsViewerPanel = new DocsViewerProvider(panel, extensionUri);
    }



    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, data?: PayloadData) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._data = data;


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
                }
            },
            null,
            this._disposables
        );
    }

    public dispose() {
        DocsViewerProvider.currentDocsViewerPanel = undefined;

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
        const nonce = WebviewTool.getNonce();

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
                Loading...
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    static getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
        return {
            // Enable javascript in the webview
            enableScripts: true,

            // And restrict the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'static', 'docs')]
        };
    }
}
