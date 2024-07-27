import { TreeItem } from 'vscode';
import { HookObserver } from '../HookObserver';

interface IHookViewStrategy {
  getChildren(hookObserver: HookObserver, element?: TreeItem): Promise<TreeItem[]>;
}

export default IHookViewStrategy;
