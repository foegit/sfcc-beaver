import { App } from '../../App';
import { CommandCb } from '../../app/CommandRegistry';
import { HookObserver } from './HookObserver';
import { registerHookCommands } from './hooksCommands';

// class AbstractFeatureApp {
//   constructor(public rootApp: App) {}

//   registerCommand(name: string, callback: CommandCb) {
//     this.rootApp.commandRegistry.add(name, callback);
//   }
// }

// export class HookApp extends AbstractFeatureApp {
//   public hookObserver: HookObserver;

//   constructor(public rootApp: App) {
//     super(rootApp);

//     this.hookObserver = new HookObserver(this);

//     registerHookCommands(this);
//   }
// }
