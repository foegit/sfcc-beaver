<!-- markdownlint-disable -->

# Change Log

## 3.6.0 - 2024-08-24

### Features

- Copying of code blocks from documentation page
- A button to attach/deattach documentation tab to side

### Bugs

- Documentation search works again. This version utilizes "old" documentation portal hosted by https://sfcclearning.com/. Support for the official docs is on the roadmap.

### Improvements

- Documentation UI/UX improvements
  - Updated look and feel of the documentation
  - Modern code highlighting
  - Modern table presentation
  - Improved search error feedback

## 3.5.2 - 2024-08-19

### Improvements

- Hooks watchers and commands memory leaks fixes
- Key binding for Hook Search on Mac is now `Command + Shift + H` since `Command + H` is Mac's system Hide Window shortcut.

### Bugs

- Fixed missing keybinding for Hook Search

## 3.5.1 - 2024-08-12

### Improvements

- Added hooks.json schema validation (internal)
- Added steptypes.json schema validation (external)

## 3.5.0 - 2024-08-05

### Features

- Hooks search.
- Hooks search shortcut:
  - Windows: `Ctrl + Shift + H`
  - Mac: `⌘ + H`
- Hooks filter.

### Improvements

- For Tags hooks are now grouped by first two words.
- Tags shows how much hooks it contains
- Broken configuration is now reported in the list

## 3.4.0 - 2024-07-27

### Features

- Added tag view for hooks (configurable). Now hooks can be grouped by the first hook part: `app.custom.hook` will be placed under `app` tag
- Added compact view for hooks with single implementation (configurable). When activating single hooks will be opened automatically without need to expand.
- Added Collapse All to hooks view. Now all items can be closed by clicking one button

### Bugs

- Fix a bug when cartridges name were not detected if cartridges are located in the root folder

### Improvements

- Focusing now selects the found word instead of placing a cursor in front of the word
- Added focusing for hook definition files
- Added dw.scapi hooks detection
- Made commands names more consistent

## 3.3.0 - 2024-07-17

### Features

- Added hooks overview:
  - All project hooks are listed on the sidebar panel
  - Hooks are split into 3 main category: system, API (OCAPI/SCAPI) and custom
  - Hook name can be copied
  - A hook can be pinned
  - Clicking on hook's implementation opens a file with it
  - From hook implementation it's possible to open definition hook.js
  - Hooks with missing implementation are marked red.
  - Changes made into hook.json and packages.json are automatically detected, otherwise refresh button can be used.

### Improvements

- Optimize extension activation to avoid loading in non-SFCC projects
- Other minor code and performance improvements

### Bugfixes

- Override command was not working on Mac

## 2.1.0 - 2022-09-14

### New Features

- Added SFCC documentation search. You can search directly in VS Code.
- DW classes hovers that allow opening documentation.

### Bugfixes

- Allow overriding of PD components in case they are located in modules folder

## 1.4.0 - 2022-05-13

- Added cartridges overview
- Added cartridge pining

## 1.3.0 - 2022-05-07

- Added override feature
- Fixed a bug with modules folder

## 1.2.0 - 2022-05-02

- Pre-release version of override feature

## 1.1.3 - 2022-05-02

- Bugfixes

## 1.1.0 - 2022-04-10

- Added unix path command

## 1.0.0 - 2022-04-10

- First stable version
