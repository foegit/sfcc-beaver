import { ThemeIcon, TreeItem } from 'vscode';

export class CommonTreenItem extends TreeItem {
  constructor({
    title,
    commandOnClickName,
    commandOnClickTitle = '',
    description,
    icon,
    contextValue,
  }: {
    title: string;
    commandOnClickName?: string;
    commandOnClickTitle?: string;

    description?: string;
    icon?: ThemeIcon;
    contextValue?: string;
  }) {
    super(title);

    if (description) {
      this.description = description;
    }

    if (icon) {
      this.iconPath = icon;
    }

    if (commandOnClickName) {
      this.command = {
        command: commandOnClickName,
        title: commandOnClickTitle,
      };
    }

    if (contextValue) {
      this.contextValue = contextValue;
    }
  }
}
