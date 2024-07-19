import { Uri, workspace, WorkspaceFolder } from 'vscode';
import * as path from 'path';

/**
 * @class tool to work with path
 */
export default class PathTool {
    /**
     * Ensures path is in Posix-format e.g. src\\app\\index.js -> src/app/index.js
     * @param relativePath
     * @returns Posix-like path
     */
    static toPosixPath(relativePath: string) {
        return relativePath.split(path.sep).join(path.posix.sep);
    }

    /**
     * Gets absolute Posix path
     * @param relativePath
     */
    static getAbsPosixPath(workspaceFolder: WorkspaceFolder, relativePath: string) {
        var posixPath = PathTool.toPosixPath(relativePath);
        var result = path.posix.join(workspaceFolder.uri.path, posixPath);

        return result;
    }

    /**
     * Checks if there is such folder in given path
     * @param fsPath - windows- or unix-like path
     * @param folderName - folder name to check
     */
    static hasFolder(fsPath: string, folderName: string): boolean {
        const matchRegExp = new RegExp(`.*([\\\\/])${folderName}(?:\\1|$)`);

        return matchRegExp.test(fsPath);
    }

    /**
     * Checks if there is such folder in given path
     * @param fsPath - windows- or unix-like path
     * @param subPath - folder name to check
     */
    static hasSubPath(fsPath: string, subPath: string): boolean {
        const folders = subPath.split(/[\\/]/);
        const matchRegExp = new RegExp(`.*([\\\\/])${folders.join('([\\\\/])')}(?:\\1|$)`);

        return matchRegExp.test(fsPath);
    }

    /**
     * Gets folder start index in given path starting from separator (/)
     * @param fsPath - windows- or unix-like path
     * @param folderName - folder name to search
     * @returns index or -1 if not found
     */
    static indexOfFolder(fsPath: string, folderName: string): number {
        const searchRegExp = new RegExp(`([\\\\/])${folderName}(?:\\1|$)`);
        const indexResult = fsPath.search(searchRegExp);

        return indexResult;
    }

    /**
     * Gets a project root related path for an absolute path
     * @param fullPath
     * @returns
     */
    static getProjectRelatedPath(fullPath: string): string {
        const openWorkspaces = workspace.workspaceFolders;

        if (!openWorkspaces || openWorkspaces.length === 0) {
            return fullPath;
        }

        const projectDirectoryPath = openWorkspaces[0].uri.fsPath;
        const filePathRelatedToRoot = fullPath.replace(`${projectDirectoryPath}`, '').replace(/^[\/\\]/, '');
        return filePathRelatedToRoot;
    }
}
