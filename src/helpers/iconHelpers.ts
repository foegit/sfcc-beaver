import { ThemeColor, ThemeIcon } from 'vscode';

export const colors = {
  yellow: new ThemeColor('terminal.ansiYellow'),
  blue: new ThemeColor('charts.blue'),
  purple: new ThemeColor('charts.purple'),
  green: new ThemeColor('charts.green'),
  red: new ThemeColor('charts.red'),
  orange: new ThemeColor('charts.orange'),
};

export function getPinnedIcon() {
  return new ThemeIcon('pinned', colors.yellow);
}
