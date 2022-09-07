import * as vscode from 'vscode';
import axios from 'axios';
import normalizeUrl from 'normalize-url';
import * as cheerio from 'cheerio';
import WebviewTool from '../classes/tools/WebviewTool';
import Clipboard from '../classes/Clipboard';

class PayloadData {
    public relativeLink: string;
    public baseURL: string;

    constructor(url: string) {
        this.relativeLink = url;
        this.baseURL = url;
    }
}

class HistoryItem {
    constructor(public absUrl: string ) {};
}

class History {
    private history: Array<HistoryItem> = [];
    private activeIndex: number = 0;
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
    private readonly extensionUrl: vscode.Uri;

    private _disposables: vscode.Disposable[] = [];
    private history: Array<HistoryItem> = [];

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

    public openInBrowserCurrent() {
        const lastHistory = this.history[this.history.length - 1];

        vscode.env.openExternal(vscode.Uri.parse(lastHistory.absUrl));
    }

    public copyCurrentURLToClipbord() {
        const lastHistory = this.history[this.history.length - 1];

        if (lastHistory) {
            Clipboard.toClipboard(lastHistory.absUrl);
        }
    }

    public moveBack() {
        if (this.history.length > 2) {
            const lastHistory = this.history[this.history.length - 2];

            this.loadDocumentationTopic(lastHistory.absUrl);
        }
    }

    public moveForward() {
        // TODO
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

    prepareDocumentationPage(htmlResponse: string) {
        const $ = cheerio.load(htmlResponse);
        const $body = $('body');

        $body.find('script').remove();
        $body.find('#cookieConsent').remove();
        $body.find('.copyright, .copyright_table').remove();
        $body.find('.banner').remove();
        $body.find('.packageName').remove();
        $body.find('.detailName').remove();
        $body.find('hr').remove();
        $body.find('a').removeAttr('target');
        const $hierarchy = $body.find('.hierarchy');

        if ($hierarchy.length > 0) {
            $hierarchy.find('img').remove();
        }

        const $breadcrumbs = $body.find('.help_breadcrumbs');

        if ($breadcrumbs.length > 0) {
            const $allBreadcrumbsLinks = $breadcrumbs.find('a');

            $breadcrumbs.empty();

            $allBreadcrumbsLinks.each((i, $el) => {
                $breadcrumbs.append($el);
                if ($allBreadcrumbsLinks.length !== i + 1) {
                    $breadcrumbs.append(' / ');
                }
            });
        }

        $body.find('.header:contains("Method Summary")').closest('.section').remove();

        return $body.html();
    }

    async loadDocumentationTopic(topicURL: string) {
        this.history.push(new HistoryItem(topicURL));
        console.log(this.history);

        console.debug('Start loading documentation page');

        this._panel.webview.postMessage({
            type: 'beaver:host:docs:startLoading'
        });

        const content = await axios.get(topicURL);

        return this._panel.webview.postMessage({
            type: 'beaver:host:docs:updateDetails',
            originalURL: topicURL,
            html: this.prepareDocumentationPage(content.data)
        });
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        DocsViewerProvider.currentDocsViewerPanel = new DocsViewerProvider(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this.extensionUrl = extensionUri;


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
                switch (message.type) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                    case 'beaver:host:docs:openExternalLink':
                        if (message.url && message.url !== '#') {
                            vscode.env.openExternal(vscode.Uri.parse(message.url));
                        }
                        return;
                    case 'beaver:client:docs:loadLink':
                        if (message.url && message.url !== '#') {
                            console.log('LOADING ' + message.url);
                            this.loadDocumentationTopic(message.url);
                        }
                    case 'beaver:client:docs:back':
                        if (message.url && message.url !== '#') {
                            this.loadDocumentationTopic(message.url);
                        }
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

                <link href="${this.getResourceUri('css/reset.css')}" rel="stylesheet" />
                <link href="${this.getResourceUri('css/vscode.css')}" rel="stylesheet" />
                <link href="${this.getResourceUri('css/docsViewer.css')}" rel="stylesheet" />
                <link href="${this.getResourceUri('css/customLoader.css')}" rel="stylesheet" />


                <title>🦫 SFCC Docs</title>
            </head>
            <body>
                <div href="#" class="bv-open-in-browser"></div>
                <div class="bv-custom-loader-wrapper progress"><div class="bv-custom-loader"></div></div>
                <div class="bv-details-content"></div>
                <script nonce="${nonce}" src="${this.getResourceUri('js/docsViewer.js')}"></script>
            </body>
            </html>`;
    }

    static getWebviewOptions(extensionUri: vscode.Uri) {
        return {
            enableScripts: true,
            enableFindWidget: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri)]
        };
    }

        /**
     * Create URL to webview static resource
     */
        private getResourceUri(resourceRelativePath: string) {
            return this._panel.webview.asWebviewUri(
                vscode.Uri.joinPath(this.extensionUrl, 'static/webview2', resourceRelativePath)
            );
        }
}
