import { commands, ExtensionContext } from 'vscode';

export type CommandCb = (...args: any[]) => any;

export type Command = {
  name: string;
  callback: CommandCb;
};

export class CommandRegistry {
  constructor(private extContext: ExtensionContext) {}

  add(name: string, callback: CommandCb) {
    const disposal = commands.registerCommand(name, callback);

    this.extContext.subscriptions.push(disposal);
  }

  addMany(commands: { [key: string]: CommandCb }) {
    for (let commandName in commands) {
      this.add(commandName, commands[commandName]);
    }
  }
}
