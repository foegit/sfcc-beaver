import * as vscode from 'vscode';
import { AxiosError } from 'axios';
import WebviewTool from '../classes/tools/WebviewTool';
import DocsSearchProvider from '../features/documentation/DocsSearch';
import { SearchResult } from '../features/documentation/IDocsSearchAdaptor';
import { getDocsAdaptor, getDocsProviderLabel } from '../features/documentation/docsAdaptorFactory';
import { getSetting, updateSetting } from '../helpers/settings';
import { SfccOfficialDeveloperAdaptor } from '../features/documentation/SfccOficialDeveloperAdaptor';

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
          this.onNewSearch(data.query);
          break;
        }
        case 'beaver:webview:docs:showPage': {
          vscode.commands.executeCommand('sfccBeaver.openDocsDetails', { absoluteLink: data.linkHref });
          break;
        }
        case 'beaver:webview:docs:switchProvider': {
          await updateSetting('docs.provider', data.provider);
          await this.refreshPanel(webviewView);
          break;
        }
      }
    });
  }

  private async refreshPanel(webviewView: vscode.WebviewView) {
    const provider = getSetting('docs.provider');
    const needsIndexing = provider === 'b2cdevdoc' && !(await SfccOfficialDeveloperAdaptor.getCacheMtime());

    webviewView.webview.html = this.renderInitialHTML(webviewView.webview, needsIndexing);

    if (needsIndexing) {
      new SfccOfficialDeveloperAdaptor()
        .forceReindex()
        .then(() => {
          webviewView.webview.html = this.renderInitialHTML(webviewView.webview, false);
        })
        .catch(console.error);
    }
  }

  private async onNewSearch(query: string) {
    const result = await this.searchInDocs(query);

    if (result.error) {
      return this.webview?.webview.postMessage({
        type: 'beaver:host:docs:updateResults',
        error: true,
        message: result.errorMsg,
      });
    }

    this.webview?.webview.postMessage({
      type: 'beaver:host:docs:updateResults',
      data: result,
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
      return 'Timeout during connection to SFCC docs. Try again';
    }

    return 'Connection issues';
  }

  private async searchInDocs(query: string): Promise<SearchResult> {
    try {
      const docsSearch = new DocsSearchProvider(getDocsAdaptor());

      return await docsSearch.search(query);
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          error: true,
          errorMsg: this.getErrorMessage(error),
        };
      }

      return {
        error: true,
        errorMsg: 'Unknown error happened',
      };
    }
  }

  private renderInitialHTML(webview: vscode.Webview, needsIndexing: boolean) {
    const nonce = WebviewTool.getNonce();
    const provider = getSetting('docs.provider');

    const sfccActive = provider === 'sfcclearning' ? 'active' : '';
    const b2cActive = provider === 'b2cdevdoc' ? 'active' : '';

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
                <body${needsIndexing ? ' data-indexing="true"' : ''}>
                    <div class="bv-docs-root">
                        <div class="bv-docs-header">
                            <div class="bv-provider-toggle">
                                <button class="bv-provider-btn ${sfccActive}" data-provider="sfcclearning">SFCC Learning</button>
                                <button class="bv-provider-btn ${b2cActive}" data-provider="b2cdevdoc">B2C Dev Docs</button>
                            </div>
                            <form class="bv-search-form">
                                <input type="text" class="bv-search-input" placeholder="Search ${getDocsProviderLabel(provider)}"/>
                                <div class="bv-search-status"><div class="bv-search-status-loader"></div></div>
                                <div class="bv-search-feedback">Type something to search</div>
                            </form>
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
