/* eslint-disable @typescript-eslint/naming-convention */
import { workspace } from 'vscode';

// Types
type SettingName<T = any> = {
  [K in keyof ConfigType]: ConfigType[K] extends {
    default: T;
  }
    ? K
    : never;
}[keyof ConfigType];

type ArraySettingName = SettingName<any[]>;
type ConfigType = typeof settingsDefinition;
type SettingType<TName extends keyof typeof settingsDefinition> = (typeof settingsDefinition)[TName]['default'];

// Settings configuration
const settingsDefinition = {
  'cartridges.pinnedCartridges': {
    default: [] as string[],
  },
  'hooks.pinnedHooks': {
    default: [] as string[],
  },
  'general.enabled': {
    default: 'auto_enabled' as 'auto_enabled' | 'enabled' | 'disabled',
  },
  'copy.addLineNumberForUnix': {
    default: false,
  },
};

function getExtensionConfiguration() {
  return workspace.getConfiguration('sfccBeaver');
}

export function getSetting<T extends SettingName>(settingName: T): SettingType<T> {
  return getExtensionConfiguration().get(settingName) || (settingsDefinition[settingName].default as SettingType<T>);
}

export async function updateSetting<T extends SettingName>(
  settingName: T,
  value: SettingType<T> | ((currentValue: SettingType<T>) => SettingType<T>)
) {
  const currentValue = getSetting(settingName);

  const newValue = typeof value === 'function' ? value(currentValue) : value;

  await getExtensionConfiguration().update(settingName, newValue, false);
}

export async function addToSettingList<T extends ArraySettingName>(settingName: T, value: SettingType<T>[0]) {
  await updateSetting(settingName, (currentArray) => {
    if (!currentArray.includes(value)) {
      currentArray.push(value);
    }

    return currentArray;
  });
}

export async function removeFromSettingList<T extends ArraySettingName>(settingName: T, value: SettingType<T>[0]) {
  await updateSetting(settingName, (currentArray) => {
    if (currentArray.includes(value)) {
      return currentArray.filter((val) => val !== value);
    }

    return currentArray;
  });
}

export function isSettingOn(settingName: SettingName) {
  return !!getSetting(settingName);
}
