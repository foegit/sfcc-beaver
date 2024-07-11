import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import BeaverError, { ErrCodes } from '../errors/BeaverError';

export default class FsTool {
    static parseCurrentProjectJsonFile(filePath: string) {
        if (!vscode.workspace.workspaceFolders) {
            throw new BeaverError(ErrCodes.noActiveEditor);
        }

        const [workspaceFolder] = vscode.workspace.workspaceFolders;

        try {
            const absoluteFilePath = path.join(
                workspaceFolder.uri.fsPath,
                filePath
            );
            if (!fs.existsSync(absoluteFilePath)) {
                throw new Error('File not found');
            }

            const file = fs.readFileSync(absoluteFilePath);
            const parsedFile = JSON.parse(file.toString());

            return parsedFile;
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message, err.stack);
            }
            return null;
        }
    }
}
