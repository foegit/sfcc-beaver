import { FileSystemWatcher, workspace } from 'vscode';
import HookModule from './HookModule';

export function registerHookWatcher(hookModule: HookModule) {
  const onAnyUpdate = async () => {
    await hookModule.parseHooks();
    hookModule.refreshHooksView();
  };

  hookModule.watcherRegistry.add('**/hooks.json', {
    onAny: onAnyUpdate,
  });

  hookModule.watcherRegistry.add('**/package.json', {
    onAny: onAnyUpdate,
  });
}
