import { FileSystemWatcher, workspace } from 'vscode';
import { HookObserver } from './HookObserver';

async function reIndexHooks(hookObserver: HookObserver) {
  await hookObserver.loadHookPoints();
  hookObserver.refresh();
}

function handleHookWatcher(watcher: FileSystemWatcher, hookObserver: HookObserver) {
  watcher.onDidChange(async () => {
    reIndexHooks(hookObserver);
  });
  watcher.onDidCreate(async () => {
    reIndexHooks(hookObserver);
  });
  watcher.onDidDelete(async () => {
    reIndexHooks(hookObserver);
  });
}

export function registerHookWatcher(hookObserver: HookObserver) {
  const hooksJsonWatcher = workspace.createFileSystemWatcher('**/hooks.json');
  const packageJsonWatcher = workspace.createFileSystemWatcher('**/package.json');

  handleHookWatcher(hooksJsonWatcher, hookObserver);
  handleHookWatcher(packageJsonWatcher, hookObserver);
}
