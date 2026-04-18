import { ThemeIcon, TreeItem } from 'vscode';
import { getPinnedIcon } from '../../helpers/iconHelpers';
import SFCCCartridge from '../../classes/SFCCCartridge';

function getIcon(sfccCartridge: SFCCCartridge) {
  if (sfccCartridge.isPinned()) {
    return getPinnedIcon();
  }

  return new ThemeIcon(sfccCartridge.getIcon());
}

function getContextValue(sfccCartridge: SFCCCartridge): string {
  const pinned = sfccCartridge.isPinned();
  const excluded = sfccCartridge.isSearchExcluded();

  if (pinned && excluded) {
    return 'sfccPinnedExcludedCartridgeTreeItem';
  }
  if (pinned) {
    return 'sfccPinnedCartridgeTreeItem';
  }
  if (excluded) {
    return 'sfccExcludedCartridgeTreeItem';
  }
  return 'sfccCartridgeTreeItem';
}

export default class CartridgeTreeItem extends TreeItem {
  private sfccCartridge: SFCCCartridge;

  constructor(sfccCartridge: SFCCCartridge) {
    super(sfccCartridge.getName());

    this.sfccCartridge = sfccCartridge;
    this.contextValue = getContextValue(sfccCartridge);
    this.iconPath = getIcon(this.sfccCartridge);

    if (sfccCartridge.isSearchExcluded()) {
      this.description = 'search excluded';
    }
  }

  public getName() {
    return this.sfccCartridge.getName();
  }
}
