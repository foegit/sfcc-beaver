import { ExtensionContext, workspace } from 'vscode';

type WatcherHandlers = {
  onAny?: () => any;
  onCreate?: () => any;
  onChange?: () => any;
  onDelete?: () => any;
};

export class WatcherRegistry {
  constructor(private extContext: ExtensionContext) {}

  add(globPattern: string, watcherHandlers: WatcherHandlers) {
    const watcher = workspace.createFileSystemWatcher(globPattern);

    if (watcherHandlers.onAny) {
      watcher.onDidCreate(watcherHandlers.onAny);
      watcher.onDidChange(watcherHandlers.onAny);
      watcher.onDidDelete(watcherHandlers.onAny);
    }

    if (watcherHandlers.onCreate) {
      watcher.onDidCreate(watcherHandlers.onCreate);
    }

    if (watcherHandlers.onChange) {
      watcher.onDidChange(watcherHandlers.onChange);
    }

    if (watcherHandlers.onDelete) {
      watcher.onDidDelete(watcherHandlers.onDelete);
    }

    this.extContext.subscriptions.push(watcher);
  }
}
