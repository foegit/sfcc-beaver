import * as vscode from 'vscode';
import DocsViewerProvider from './DocsViewerProvider';
import DocsNavigatorProvider from './DocsNavigatorProvider';

export default class WebviewMgr {
  static init(context: vscode.ExtensionContext) {
    const searchProvider = new DocsNavigatorProvider(context.extensionUri);

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(DocsNavigatorProvider.viewType, searchProvider)
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('sfccBeaver.openDocsDetails', (data) => {
        DocsViewerProvider.createOrShow(context.extensionUri, data);
      })
    );
    context.subscriptions.push(
      vscode.commands.registerCommand('sfccBeaver.docsOpenInBrowser', (data) => {
        DocsViewerProvider.currentDocsViewerPanel?.openInBrowserCurrent();
      })
    );
    context.subscriptions.push(
      vscode.commands.registerCommand('sfccBeaver.docs.toggleColumn', DocsViewerProvider.toggleView)
    );
    context.subscriptions.push(
      vscode.commands.registerCommand('sfccBeaver.docsCopyToClipboard', (data) => {
        DocsViewerProvider.currentDocsViewerPanel?.copyCurrentURLToClipboard();
      })
    );
    context.subscriptions.push(
      vscode.commands.registerCommand('sfccBeaver.docsNavigationBack', (data) => {
        DocsViewerProvider.currentDocsViewerPanel?.openPreviousPage();
      })
    );
    context.subscriptions.push(
      vscode.commands.registerCommand('sfccBeaver.docsNavigationForward', (data) => {
        DocsViewerProvider.currentDocsViewerPanel?.openNextPage();
      })
    );

    if (vscode.window.registerWebviewPanelSerializer) {
      vscode.window.registerWebviewPanelSerializer(DocsViewerProvider.viewType, {
        async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
          webviewPanel.webview.options = DocsViewerProvider.getWebviewOptions(context.extensionUri);

          DocsViewerProvider.revive(webviewPanel, context.extensionUri);
        },
      });
    }
  }
}
