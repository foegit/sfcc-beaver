import * as vscode from 'vscode';
import ApiDocsHoverProvider from './ApiDocsHoverProvider';

export default class HoverManager {
    static init(context: vscode.ExtensionContext) {
        new ApiDocsHoverProvider(context);
    }
}
