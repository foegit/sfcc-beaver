import * as vscode from 'vscode';

/**
 * @class tool to work with settings
 */
export default class SettingTool {
    static getBeaverConfig() {
        return vscode.workspace.getConfiguration('sfccBeaver');
    }

    static getPinnedCartridges():string[] {
        return SettingTool.getBeaverConfig().pinnedCartridges;
    }

    static async addPinnedCartridge(cartridgeName: string): Promise<void> {
        const currentConfig = SettingTool.getPinnedCartridges();

        if (currentConfig.includes(cartridgeName)) {
            return;
        }

        const newConfig = [...currentConfig, cartridgeName];

        await SettingTool.getBeaverConfig().update('pinnedCartridges', newConfig, false);
    }

    static async removePinnedCartridge(cartridgeName: string): Promise<void> {
        const currentConfig = SettingTool.getPinnedCartridges();
        const newConfig = currentConfig.filter(pinnedCartridge => pinnedCartridge !== cartridgeName);

        await SettingTool.getBeaverConfig().update('pinnedCartridges', newConfig, false);
    }
}