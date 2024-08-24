import * as fs from 'fs';
import * as path from 'path';
import BeaverError, { ErrCodes } from '../errors/BeaverError';
import PathTool from './PathTool';
import { Uri, window, workspace } from 'vscode';

export default class FsTool {
  static getCurrentWorkspaceFolder() {
    if (!workspace.workspaceFolders) {
      throw new BeaverError(ErrCodes.noActiveEditor);
    }

    return workspace.workspaceFolders[0];
  }

  static parseCurrentProjectJsonFile(filePath: string) {
    const workspaceFolder = FsTool.getCurrentWorkspaceFolder();

    try {
      const absoluteFilePath = path.join(workspaceFolder.uri.fsPath, filePath);
      if (!fs.existsSync(absoluteFilePath)) {
        throw new Error(`File not found: ${absoluteFilePath}`);
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

  static async write(filePath: string, content: string) {
    const workspaceFolder = FsTool.getCurrentWorkspaceFolder();

    try {
      const absoluteFilePath = Uri.joinPath(workspaceFolder.uri, filePath);

      await workspace.fs.writeFile(absoluteFilePath, Buffer.from(content));
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message, err.stack);
      }

      return null;
    }
  }

  static fileExist(filePath: string) {
    const workspaceFolder = FsTool.getCurrentWorkspaceFolder();

    const absoluteFilePath = path.join(workspaceFolder.uri.fsPath, filePath);

    return fs.existsSync(absoluteFilePath);
  }
}
