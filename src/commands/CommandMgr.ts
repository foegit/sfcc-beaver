import * as vscode from 'vscode';
import { copyInclude, copyUnixPath } from './copy';
import { overrideFile } from './override';

export default class CommandMgr {
    static init(context: vscode.ExtensionContext) {
        const copyPathCommand = vscode.commands.registerCommand('sfccBeaver.extract', copyInclude);
        const overrideFileCommand = vscode.commands.registerCommand('sfccBeaver.override', overrideFile);
        const copyUnixPathCommand = vscode.commands.registerCommand('sfccBeaver.unixpath', copyUnixPath);

        context.subscriptions.push(copyPathCommand);
        context.subscriptions.push(overrideFileCommand);
        context.subscriptions.push(copyUnixPathCommand);
    }
}
