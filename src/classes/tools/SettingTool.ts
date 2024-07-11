import * as vscode from 'vscode';

type SettingName = 'pinnedCartridges' | 'pinnedHooks';

/**
 * @class tool to work with settings
 */
export default class SettingTool {
    static getBeaverConfig() {
        return vscode.workspace.getConfiguration('sfccBeaver');
    }

    static getPinnedCartridges(): string[] {
        return SettingTool.getBeaverConfig().pinnedCartridges;
    }

    static getPinnedHooks(): string[] {
        return SettingTool.getBeaverConfig().pinnedHooks;
    }

    static async addPinnedCartridge(cartridgeName: string): Promise<void> {
        const currentConfig = SettingTool.getPinnedCartridges();

        if (currentConfig.includes(cartridgeName)) {
            return;
        }

        const newConfig = [...currentConfig, cartridgeName];

        await SettingTool.getBeaverConfig().update(
            'pinnedCartridges',
            newConfig,
            false
        );
    }

    static async removePinnedCartridge(cartridgeName: string): Promise<void> {
        const currentConfig = SettingTool.getPinnedCartridges();
        const newConfig = currentConfig.filter(
            (pinnedCartridge) => pinnedCartridge !== cartridgeName
        );

        await SettingTool.getBeaverConfig().update(
            'pinnedCartridges',
            newConfig,
            false
        );
    }

    static async addToList(settingName: SettingName, value: string) {
        const beaverSettings = SettingTool.getBeaverConfig();
        const currentValues: string[] | undefined =
            beaverSettings.get(settingName);

        if (!currentValues || currentValues.includes(value)) {
            return;
        }

        await beaverSettings.update(
            settingName,
            [...currentValues, value],
            false
        );
    }

    static async removeFromList(settingName: SettingName, value: string) {
        const beaverSettings = SettingTool.getBeaverConfig();
        const currentValues: string[] | undefined =
            beaverSettings.get(settingName);

        if (!currentValues || !currentValues.includes(value)) {
            return;
        }

        await beaverSettings.update(
            settingName,
            currentValues.filter((val) => val !== value),
            false
        );
    }

    static async removePinnedHook(cartridgeName: string): Promise<void> {
        const currentConfig = SettingTool.getPinnedCartridges();
        const newConfig = currentConfig.filter(
            (pinnedCartridge) => pinnedCartridge !== cartridgeName
        );

        await SettingTool.getBeaverConfig().update(
            'pinnedCartridges',
            newConfig,
            false
        );
    }
}
