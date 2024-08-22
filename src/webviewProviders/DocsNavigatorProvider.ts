import * as vscode from 'vscode';
import * as cheerio from 'cheerio';
import axios, { AxiosError } from 'axios';
import WebviewTool from '../classes/tools/WebviewTool';
import DocsSearchProvider from '../features/documentation/DocsSearch';
import { SfccLearningSearchAdaptor } from '../features/documentation/SfccLearningSearchAdaptor';
import { SearchResult } from '../features/documentation/IDocsSearchAdaptor';
import { SfccOfficialDeveloperAdaptor } from '../features/documentation/SfccOficialDeveloperAdaptor';

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
          this.onNewSearch(data.query);
          break;
        }
        case 'beaver:webview:docs:showPage': {
          // const relativeLink = data.linkHref.replace('../topic/', '/').replace(/\?resultof=.*/g, '');

          vscode.commands.executeCommand('sfccBeaver.openDocsDetails', { absoluteLink: data.linkHref });
          break;
        }
      }
    });
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

  private generateCountMessage(resultsCount: number) {
    if (resultsCount === 0) {
      return 'Nothing found. Check for typo or try rephrase';
    }
    if (resultsCount === 1) {
      return 'One topic is found';
    }

    return `${resultsCount} topics found`;
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

  /**
   * Performs search by query
   */
  private async searchInDocs(query: string): Promise<SearchResult> {
    try {
      // const docsSearch = new DocsSearchProvider(new SfccOfficialDeveloperAdaptor());
      const docsSearch = new DocsSearchProvider(new SfccLearningSearchAdaptor());

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
                        content="default-src 'none'; style-src ${
                          webview.cspSource
                        }; img-src *; script-src 'nonce-${nonce}';"
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
      vscode.Uri.joinPath(this.extensionUri, 'static/webview2', resourceRelativePath)
    );
  }
}
