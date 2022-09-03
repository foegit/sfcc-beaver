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

                    const res = this.prepareResponse(result);

                    this.webview?.webview.postMessage({
                        type: 'beaver:host:docs:updateResults',
                        data: res
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

    private generateCountMessage(resultsCount: number) {
        if (resultsCount === 0) {
            return 'Nothing found. Check for typo or try rephrase';
        }
        if (resultsCount === 1) {
            return 'One topic is found';
        }

        return `${resultsCount} topics found`;
    }

    private prepareResponse(result: string) {
        const $ = cheerio.load(result);
        const $resultsTable = $('table.results');

        const $allLinks = $resultsTable.find('a');
        const $icons = $resultsTable.find('td.icon img');
        const resultCount = $icons.length;

        $icons.remove();
        $allLinks.removeAttr('onmouseover');
        $allLinks.removeAttr('onmouseout');

        return { message: this.generateCountMessage(resultCount), html: $resultsTable.html() };
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
                    <link href="${this.getResourceUri('css/docsProvider.css')}" rel="stylesheet" />

                    <title>SFCC Docs</title>
                </head>
                <body>
                    <form class="bv-search-form">
                    <input type="text" class="bv-search-input" placeholder="Search"/>
                        <div class="bv-search-status"><div class="bv-search-status-loader"></div></div>
                        <div class="bv-search-feedback">Type something to search</div>
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
