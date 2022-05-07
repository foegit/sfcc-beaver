import * as vscode from 'vscode';

/**
 * @class tool to work with settings
 */
export default class SettingTool {
    static getBeaverConfig() {
        return vscode.workspace.getConfiguration('sfccBeaver');
    }

    static getFavoriteCartridges():string[] {
        const rawValue = SettingTool.getBeaverConfig().favoriteCartridges;
        const cartridgeList = rawValue.replace(/\s/g, '').split(',');

        return cartridgeList;
    }
}