import HookTagTreeItem from './treeItems/HookTagTreeItem';

export function sortTags(tagTreeItems: HookTagTreeItem[]) {
  return [...tagTreeItems].sort((ti1, ti2) => {
    if (ti1.isPinned) {
      return -1;
    }

    if (ti2.isPinned) {
      return 1;
    }

    return ti1.name.localeCompare(ti2.name);
  });
}
