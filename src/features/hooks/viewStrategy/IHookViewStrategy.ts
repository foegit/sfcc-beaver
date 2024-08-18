import { TreeItem } from 'vscode';
import HookModule from '../HookModule';

interface IHookViewStrategy {
  getChildren(hookModule: HookModule, element?: TreeItem): Promise<TreeItem[]>;
}

export default IHookViewStrategy;
