import * as vscode from 'vscode';
import { AxiosError } from 'axios';
import WebviewTool from '../classes/tools/WebviewTool';
import DocsSearchProvider from '../features/documentation/DocsSearch';
import { SearchResult } from '../features/documentation/IDocsSearchAdaptor';
import { SfccOfficialDeveloperAdaptor } from '../features/documentation/SfccOficialDeveloperAdaptor';
import { SfccLearningSearchAdaptor } from '../features/documentation/SfccLearningSearchAdaptor';

const API_DOCS_URL = 'https://salesforcecommercecloud.github.io/b2c-dev-doc/';
const OLD_DOCS_URL = 'https://sfcclearning.com/infocenter/';

export default class DocsNavigatorProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'docsNavigator';

  private webview?: vscode.WebviewView;

  constructor(private readonly extensionUri: vscode.Uri) {}

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.webview = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    await this.refreshPanel(webviewView);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'beaver:webview:docs:search': {
          this.onNewSearch(data.query, data.tab);
          break;
        }
        case 'beaver:webview:docs:showPage': {
          vscode.commands.executeCommand('sfccBeaver.openDocsDetails', { absoluteLink: data.linkHref });
          break;
        }
        case 'beaver:webview:docs:reindex': {
          this.runReindex(webviewView);
          break;
        }
        case 'beaver:webview:docs:openExternal': {
          vscode.env.openExternal(vscode.Uri.parse(data.href));
          break;
        }
      }
    });
  }

  private async refreshPanel(webviewView: vscode.WebviewView) {
    const needsIndexing = !(await SfccOfficialDeveloperAdaptor.getCacheMtime());

    webviewView.webview.html = this.renderInitialHTML(webviewView.webview, needsIndexing);

    if (needsIndexing) {
      new SfccOfficialDeveloperAdaptor()
        .forceReindex()
        .then(() => {
          webviewView.webview.html = this.renderInitialHTML(webviewView.webview, false);
        })
        .catch(() => {
          webviewView.webview.html = this.renderInitialHTML(webviewView.webview, false);
          webviewView.webview.postMessage({
            type: 'beaver:host:docs:indexError',
            message: 'Failed to fetch API docs. Please check your connection.',
          });
        });
    }
  }

  private async runReindex(webviewView: vscode.WebviewView) {
    webviewView.webview.postMessage({ type: 'beaver:host:docs:reindexStart' });
    new SfccOfficialDeveloperAdaptor()
      .forceReindex()
      .then(() => {
        webviewView.webview.postMessage({ type: 'beaver:host:docs:reindexDone' });
      })
      .catch(() => {
        webviewView.webview.postMessage({
          type: 'beaver:host:docs:indexError',
          message: 'Failed to fetch API docs. Please check your connection.',
        });
      });
  }

  private async onNewSearch(query: string, tab: string) {
    if (tab === 'api') {
      this.refreshStaleApiCacheInBackground();
    }

    const result = await this.searchInDocs(query, tab);

    if (result.error) {
      return this.webview?.webview.postMessage({
        type: 'beaver:host:docs:updateResults',
        error: true,
        errorMsg: result.errorMsg,
        errorLink: tab === 'api' ? API_DOCS_URL : OLD_DOCS_URL,
      });
    }

    const items =
      tab === 'api'
        ? (result.items ?? []).filter((i) => i.group === 'api' || i.group === 'package')
        : result.items ?? [];

    this.webview?.webview.postMessage({
      type: 'beaver:host:docs:updateResults',
      data: { items },
    });
  }

  private refreshStaleApiCacheInBackground() {
    SfccOfficialDeveloperAdaptor.isStale().then((isStale) => {
      if (!isStale) { return; }
      new SfccOfficialDeveloperAdaptor()
        .forceReindex()
        .catch(() => {
          this.webview?.webview.postMessage({ type: 'beaver:host:docs:indexWarning' });
        });
    });
  }

  private getErrorMessage(axiosError: AxiosError) {
    if (axiosError.code === AxiosError.ERR_BAD_REQUEST) {
      return 'Something went wrong. Try again';
    }
    if (axiosError.code === 'ENOTFOUND') {
      return 'Please check your connection and try again';
    }
    if (axiosError.code === AxiosError.ETIMEDOUT) {
      return 'Timeout. Try again';
    }
    return 'Connection issues';
  }

  private async searchInDocs(query: string, tab: string): Promise<SearchResult> {
    try {
      const adaptor = tab === 'api' ? new SfccOfficialDeveloperAdaptor() : new SfccLearningSearchAdaptor();
      return await new DocsSearchProvider(adaptor).search(query);
    } catch (error) {
      if (error instanceof AxiosError) {
        return { error: true, errorMsg: this.getErrorMessage(error) };
      }
      return { error: true, errorMsg: 'Unknown error happened' };
    }
  }

  private renderInitialHTML(webview: vscode.Webview, needsIndexing: boolean) {
    const nonce = WebviewTool.getNonce();

    return `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta
                        http-equiv="Content-Security-Policy"
                        content="default-src 'none'; style-src ${webview.cspSource}; font-src ${webview.cspSource}; img-src *; script-src 'nonce-${nonce}';"
                    />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <link href="${this.getResourceUri('css/reset.css')}" rel="stylesheet" />
                    <link href="${this.getResourceUri('css/vscode.css')}" rel="stylesheet" />
                    <link href="${this.getResourceUri('css/codicon.css')}" rel="stylesheet" />
                    <link href="${this.getResourceUri('css/docsProvider.css')}" rel="stylesheet" />
                    <title>SFCC Docs</title>
                </head>
                <body${needsIndexing ? ' data-indexing="true"' : ''}>
                    <div class="bv-docs-root">
                        <div class="bv-docs-header">
                            <form class="bv-search-form">
                                <input type="text" class="bv-search-input" placeholder="Search docs"/>
                            </form>
                            <div class="bv-tabs">
                                <button class="bv-tab" data-tab="api">API</button>
                                <button class="bv-tab" data-tab="olddocs">Infocenter (Retired)</button>
                            </div>
                            <div class="bv-search-status"><div class="bv-search-status-loader"></div></div>
                        </div>
                        <div class="bv-result"></div>
                    </div>
                    <script nonce="${nonce}" src="${this.getResourceUri('js/docsNavigator.js')}"></script>
                </body>
            </html>
        `;
  }

  private getResourceUri(resourceRelativePath: string) {
    return this.webview?.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'static/webview2', resourceRelativePath)
    );
  }
}
