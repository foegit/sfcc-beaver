/**
 * @class tool to work with path
 */
export default class PathTool {
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
}