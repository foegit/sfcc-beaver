<!-- markdownlint-disable -->

# Change Log

## 3.4.0 - 2024-08-27

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
