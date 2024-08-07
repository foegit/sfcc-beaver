import * as vscode from 'vscode';
import axios from 'axios';
import normalizeUrl from 'normalize-url';
import * as cheerio from 'cheerio';
import WebviewTool from '../classes/tools/WebviewTool';
import SimpleHistory from './helpers/SimpleHistory';
import URLHistoryItem from './types/URLHistoryItem';
import CreateOrShowOptions from './types/CreateOrShowOptions';
import LoadDocumentationOptions from './types/LoadDocumentationOptions';
import { copyToClipboard } from '../helpers/clipboard';

/**
 * Manages cat coding webview panels
 */
export default class DocsViewerProvider {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentDocsViewerPanel: DocsViewerProvider | undefined;

    public static readonly viewType = 'docsViewer';

    private readonly webviewPanel: vscode.WebviewPanel;
    private readonly extensionUrl: vscode.Uri;

    private _disposables: vscode.Disposable[] = [];
    private history: SimpleHistory<URLHistoryItem> = new SimpleHistory();

    public static createOrShow(extensionUri: vscode.Uri, data: CreateOrShowOptions) {
        if (!DocsViewerProvider.currentDocsViewerPanel) {
            DocsViewerProvider.currentDocsViewerPanel = DocsViewerProvider.createDocsViewerPanel(extensionUri);
        } else {
            DocsViewerProvider.currentDocsViewerPanel.webviewPanel.reveal(vscode.ViewColumn.Beside);
        }

        const baseURL = data.baseURL || 'https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic';

        const contentUrl = normalizeUrl(`${baseURL}/${data.relativeLink}`);

        DocsViewerProvider.currentDocsViewerPanel.loadDocumentationTopic(contentUrl);
    }

    public openInBrowserCurrent() {
        const lastHistory = this.history.getActive();

        if (lastHistory) {
            vscode.env.openExternal(vscode.Uri.parse(lastHistory.url));
        }
    }

    public copyCurrentURLToClipboard() {
        const lastHistory = this.history.getActive();

        if (lastHistory) {
            copyToClipboard(lastHistory.url);
        }
    }

    public openPreviousPage() {
        const prevItem = this.history.goBack();

        if (prevItem) {
            this.loadDocumentationTopic(prevItem.url, {
                skipHistory: true,
            });
        }
    }

    public openNextPage() {
        const nextItem = this.history.goForward();

        if (nextItem) {
            this.loadDocumentationTopic(nextItem.url, {
                skipHistory: true,
            });
        }
    }

    public static openClassDoc(extensionUri: vscode.Uri, classPath: string) {
        this.createOrShow(extensionUri, {
            baseURL:
                'https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api',
            relativeLink: `/class_${classPath.replace(/\//g, '_')}.html`,
        });
    }

    public static createDocsViewerPanel(extensionUri: vscode.Uri) {
        const panel = vscode.window.createWebviewPanel(
            DocsViewerProvider.viewType,
            'Docs Viewer',
            vscode.ViewColumn.Beside,
            DocsViewerProvider.getWebviewOptions(extensionUri)
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

    async loadDocumentationTopic(url: string, options?: LoadDocumentationOptions) {
        console.log(`Start loading documentation page: "${url}"`);

        const safeOptions = options || new LoadDocumentationOptions();

        if (!safeOptions.skipHistory) {
            this.history.push(new URLHistoryItem(url));
        }

        this.webviewPanel.webview.postMessage({
            type: 'beaver:host:docs:startLoading',
        });

        const content = await axios.get(url);

        return this.webviewPanel.webview.postMessage({
            type: 'beaver:host:docs:updateDetails',
            originalURL: url,
            html: this.prepareDocumentationPage(content.data),
        });
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        DocsViewerProvider.currentDocsViewerPanel = new DocsViewerProvider(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this.webviewPanel = panel;
        this.extensionUrl = extensionUri;

        this.webviewPanel.title = '🦫 SFCC Docs';

        this.webviewPanel.webview.html = this._getHtmlForWebview(this.webviewPanel.webview);

        // Set the webview's initial html content

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this.webviewPanel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this.webviewPanel.webview.onDidReceiveMessage(
            async (message) => {
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
                        const currentURL = this.history.getActive();

                        if (message.url && message.url !== '#' && currentURL.url !== message.url) {
                            console.log('Loading new page');
                            this.loadDocumentationTopic(message.url);
                        }
                        return;
                    case 'beaver:client:docs:restoreHistory':
                        if (message.url) {
                            this.history = new SimpleHistory();
                            this.history.push(new URLHistoryItem(message.url));
                        }
                        return;
                    case 'beaver:client:docs:goBack':
                        this.openPreviousPage();
                        return;
                    case 'beaver:client:docs:goForward':
                        this.openNextPage();
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
        this.webviewPanel.dispose();

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

                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
                    webview.cspSource
                }; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

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
            localResourceRoots: [vscode.Uri.joinPath(extensionUri)],
        };
    }

    /**
     * Create URL to webview static resource
     */
    private getResourceUri(resourceRelativePath: string) {
        return this.webviewPanel.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUrl, 'static/webview2', resourceRelativePath)
        );
    }
}
