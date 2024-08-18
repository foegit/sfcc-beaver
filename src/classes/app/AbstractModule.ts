import { App } from '../../App';
import { CommandRegistry } from '../../app/CommandRegistry';
import { WatcherRegistry } from '../../app/WatcherRegistry';
import { WorkspaceStorage } from '../../app/WorkspaceStorage';

export default abstract class AbstractModule {
  public workspaceStorage: WorkspaceStorage;
  public commandRegistry: CommandRegistry;
  public watcherRegistry: WatcherRegistry;

  constructor(public app: App) {
    this.workspaceStorage = app.workspaceStorage;
    this.commandRegistry = app.commandRegistry;
    this.watcherRegistry = app.watcherRegistry;
  }
}
