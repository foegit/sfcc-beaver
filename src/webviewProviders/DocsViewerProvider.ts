import * as vscode from 'vscode';
import axios from 'axios';
import WebviewTool from '../classes/tools/WebviewTool';
import SimpleHistory from './helpers/SimpleHistory';
import { copyToClipboard } from '../helpers/clipboard';

import { SfccLearningSearchAdaptor } from '../features/documentation/SfccLearningSearchAdaptor';

/**
 * Manages cat coding webview panels
 */
export default class DocsViewerProvider {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentDocsViewerPanel: DocsViewerProvider | undefined;
  public static docsAdaptor = new SfccLearningSearchAdaptor();

  public static readonly viewType = 'docsViewer';

  private readonly webviewPanel: vscode.WebviewPanel;
  private readonly extensionUrl: vscode.Uri;

  private _disposables: vscode.Disposable[] = [];
  private history: SimpleHistory<{ url: string }> = new SimpleHistory();

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
          case 'sfccBeaver:docsViewer:openInBrowser':
            return vscode.env.openExternal(vscode.Uri.parse(this.history.getActive().url));
          case 'sfccBeaver:docsViewer:onLinkClick':
            return this.onLinkClick(message.data.href);
          case 'sfccBeaver:docsViewer:initHistory':
            if (message.data?.url) {
              this.history = new SimpleHistory();
              this.history.push(message.data);
            }
            return;
          case 'sfccBeaver:docsViewer:goBack':
            return this.openPreviousPage();
          case 'sfccBeaver:docsViewer:goForward':
            return this.openNextPage();
        }
      },
      null,
      this._disposables
    );
  }

  onLinkClick(href: string) {
    const currentURL = this.history.getActive();

    const newAbsUrl = DocsViewerProvider.docsAdaptor.clickedHrefToAbsUrl(href, currentURL.url);

    this.updatePage(newAbsUrl);
  }

  // 'https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_system_Logger.html';

  public static createOrShow(extensionUri: vscode.Uri, data: { absoluteLink: string }) {
    if (!DocsViewerProvider.currentDocsViewerPanel) {
      DocsViewerProvider.currentDocsViewerPanel = DocsViewerProvider.createDocsViewerPanel(extensionUri);
    } else {
      DocsViewerProvider.currentDocsViewerPanel.webviewPanel.reveal(vscode.ViewColumn.Beside, true);
    }

    if (data.absoluteLink) {
      DocsViewerProvider.currentDocsViewerPanel.updatePage(data.absoluteLink);
    }
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
      this.updatePage(prevItem.url, {
        skipHistory: true,
      });
    }
  }

  public openNextPage() {
    const nextItem = this.history.goForward();

    if (nextItem) {
      this.updatePage(nextItem.url, {
        skipHistory: true,
      });
    }
  }

  public static openClassDoc(extensionUri: vscode.Uri, classPath: string) {
    const url = this.docsAdaptor.getClassLink(classPath);

    this.createOrShow(extensionUri, {
      absoluteLink: url,
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

  async updatePage(url: string, options?: { skipHistory: boolean }) {
    console.log(`Start loading documentation page: "${url}"`);

    const safeOptions = options || { skipHistory: false };

    if (!safeOptions.skipHistory) {
      this.history.push({ url });
    }

    this.webviewPanel.webview.postMessage({
      type: 'beaver:host:docs:startLoading',
    });

    try {
      const content = await axios.get(url);

      return this.webviewPanel.webview.postMessage({
        type: 'beaver:host:docs:updateDetails',
        originalURL: url,
        html: await DocsViewerProvider.docsAdaptor.renderer.render(content.data),
      });
    } catch (err) {
      // eslint-disable-next-line quotes
      vscode.window.showErrorMessage("Couldn't load a page.");
      if (err instanceof Error) {
        console.log(err.message);
      }
    }
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    DocsViewerProvider.currentDocsViewerPanel = new DocsViewerProvider(panel, extensionUri);
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
            <body class="body">
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
