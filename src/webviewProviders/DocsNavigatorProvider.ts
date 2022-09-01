import * as vscode from 'vscode';
import * as cheerio from 'cheerio';
import axios from 'axios';
import WebviewTool from '../classes/tools/WebviewTool';

export default class DocsNavigatorProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'docsNavigator';
    public static readonly baseUrl = 'https://documentation.b2c.commercecloud.salesforce.com/DOC2/advanced';

    private webview?: vscode.WebviewView;

    constructor(private readonly extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this.webview = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri],
        };

        webviewView.webview.html = this.renderInitialHTML(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'beaver:webview:docs:search': {
                    const result = await this.searchInDocs(data.query);

                    const $result = this.retrieveSearchResultHTML(result);

                    this.webview?.webview.postMessage({
                        type: 'beaver:host:docs:updateResults',
                        data: $result,
                    });

                    break;
                }
                case 'beaver:webview:docs:showPage': {
                    const relativeLink  = data.linkHref
                        .replace('../topic/', '/')
                        .replace(/\?resultof=.*/g, '');

                    vscode.commands.executeCommand('sfccBeaver.openDocsDetails', { relativeLink });
                    break;
                }
            }
        });
    }

    private retrieveSearchResultHTML(result: string) {
        const $htmlDoc = cheerio.load(result);

        return $htmlDoc;
    }

    /**
     * Performs search by query
     */
    private async searchInDocs(query: string) {
        try {
            const response = await axios.get(`${DocsNavigatorProvider.baseUrl}/searchView.jsp?searchWord=${encodeURIComponent(query)}&maxHits=500`);

            return response.data;
        } catch (error) {
            return 'NOT FOUND';
        }
    }

    /**
     * Renders initial page
     */
    private renderInitialHTML(webview: vscode.Webview) {
        const nonce = WebviewTool.getNonce();

        return `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta
                        http-equiv="Content-Security-Policy"
                        content="default-src 'none'; style-src ${webview.cspSource}; img-src *; script-src 'nonce-${nonce}';"
                    />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <link href="${this.getResourceUri('css/reset.css')}" rel="stylesheet" />
                    <link href="${this.getResourceUri('css/vscode.css')}" rel="stylesheet" />

                    <title>SFCC Docs</title>
                </head>
                <body>
                    <form class="bv-search-form">
                        <input type="text" class="bv-search-input"/>
                        <button type="submit">Search</button>
                    </form>

                    <div class="bv-result"></div>

                    <script nonce="${nonce}" src="${this.getResourceUri('js/docsNavigator.js')}"></script>
                </body>
            </html>
        `;
    }

    /**
     * Create URL to webview static resource
     */
    private getResourceUri(resourceRelativePath: string) {
        return this.webview?.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'static/webview', resourceRelativePath)
        );
    }
}
