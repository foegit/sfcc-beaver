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
        if (!rawValue) {
            return [];
        }

        const cartridgeList = rawValue.replace(/\s/g, '').split(',');

        return cartridgeList;
    }

    static addCartridgeToFavorite(cartridgeName: string): void {
        const currentConfig = SettingTool.getFavoriteCartridges();

        if (currentConfig.includes(cartridgeName)) {
            return;
        }

        const newConfig = [...currentConfig, cartridgeName].join(', ');

        vscode.workspace.getConfiguration('sfccBeaver').update('favoriteCartridges', newConfig, false);
    }
}