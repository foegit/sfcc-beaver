/* eslint-disable @typescript-eslint/naming-convention */
import { ExtensionContext } from 'vscode';

type StorageType = typeof storageDefinition;

type StorageKeyType<T = any> = {
  [K in keyof StorageType]: StorageType[K] extends {
    default: T;
  }
    ? K
    : never;
}[keyof StorageType];

type StorageValueType<TName extends keyof typeof storageDefinition> = (typeof storageDefinition)[TName]['default'];

// Settings configuration
const storageDefinition = {
  'sfccBeaver.hooks.memo.lastFilter': {
    default: '',
  },
  'sfccBeaver.hooks.ignoredErrors': {
    default: [] as string[],
  },
  cartridgeList: {
    default: [] as string[],
  },
};

export class WorkspaceStorage {
  constructor(private context: ExtensionContext) {}

  get<T extends StorageKeyType>(key: T): StorageValueType<T> {
    return this.context.workspaceState.get(key) || (storageDefinition[key].default as StorageValueType<T>);
  }

  set<T extends StorageKeyType>(key: T, value: StorageValueType<T>) {
    this.context.workspaceState.update(key, value);
  }
}
