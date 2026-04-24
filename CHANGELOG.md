# Change Log

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [3.10.0]

### Added

- Cartridge search exclusion — exclude cartridges from VS Code global search via the Cartridges panel
- Status bar warning when cartridges are excluded from search (dismissable via settings)
- `sfccBeaver.cartridges.showSearchExcludeWarning` setting to hide the status bar warning

### Changed

- Hooks broken implementation errors are now combined into a single report

## [3.6.0] - 2024-08-24

### Added

- Copy code blocks from documentation page
- Button to attach/detach documentation tab to the side panel

### Changed

- Updated documentation look and feel
- Modern code highlighting and table presentation
- Improved search error feedback

### Fixed

- Documentation search is working again. This version uses the "old" portal hosted by https://sfcclearning.com/. Official docs support is on the roadmap.

## [3.5.2] - 2024-08-19

### Changed

- Fixed memory leaks in hooks watchers and commands
- Mac keybinding for Hook Search changed to `Command + Shift + H` (`Command + H` is reserved by macOS)

### Fixed

- Missing keybinding for Hook Search

## [3.5.1] - 2024-08-12

### Added

- `hooks.json` schema validation
- `steptypes.json` schema validation

## [3.5.0] - 2024-08-05

### Added

- Hooks search (Windows: `Ctrl + Shift + H`, Mac: `⌘ + H`)
- Hooks filter

### Changed

- Hooks in tag view are now grouped by the first two words
- Tags show the number of hooks they contain
- Broken hook configurations are reported in the list

## [3.4.0] - 2024-07-27

### Added

- Tag view for hooks — hooks grouped by the first part of the hook name (e.g. `app.custom.hook` → `app` tag)
- Compact view for hooks with a single implementation — single hooks expand automatically on click
- Collapse All button for hooks view

### Changed

- Focusing now selects the found word instead of placing a cursor before it
- Added focusing for hook definition files
- Added `dw.scapi` hooks detection
- Made command names more consistent

### Fixed

- Cartridge names not being detected when cartridges are in the root folder

## [3.3.0] - 2024-07-17

### Added

- Hooks overview panel:
  - All project hooks listed in the sidebar
  - Hooks split into 3 categories: system, API (OCAPI/SCAPI), and custom
  - Hook name can be copied
  - Hooks can be pinned
  - Clicking a hook implementation opens its file
  - Hook definition `hooks.js` can be opened from the implementation
  - Hooks with missing implementations are marked red
  - Changes to `hooks.json` and `package.json` are detected automatically; refresh button available as fallback

### Changed

- Optimized extension activation to skip non-SFCC projects
- Minor code and performance improvements

### Fixed

- Override command not working on Mac

## [2.1.0] - 2022-09-14

### Added

- SFCC documentation search inside VS Code
- DW class hover to open documentation

### Fixed

- Overriding PD components located in the modules folder

## [1.4.0] - 2022-05-13

### Added

- Cartridges overview
- Cartridge pinning

## [1.3.0] - 2022-05-07

### Added

- Override feature

### Fixed

- Bug with the modules folder

## [1.2.0] - 2022-05-02

### Added

- Pre-release of the override feature

## [1.1.3] - 2022-05-02

### Fixed

- Various bugfixes

## [1.1.0] - 2022-04-10

### Added

- Unix path command

## [1.0.0] - 2022-04-10

- First stable version

---

[Unreleased]: https://github.com/foegit/sfcc-beaver/compare/v3.6.0...HEAD
[3.6.0]: https://github.com/foegit/sfcc-beaver/compare/v3.5.2...v3.6.0
[3.5.2]: https://github.com/foegit/sfcc-beaver/compare/v3.5.1...v3.5.2
[3.5.1]: https://github.com/foegit/sfcc-beaver/compare/v3.5.0...v3.5.1
[3.5.0]: https://github.com/foegit/sfcc-beaver/compare/v3.4.0...v3.5.0
[3.4.0]: https://github.com/foegit/sfcc-beaver/compare/v3.3.0...v3.4.0
[3.3.0]: https://github.com/foegit/sfcc-beaver/compare/v3.0.0...v3.3.0
[2.1.0]: https://github.com/foegit/sfcc-beaver/releases/tag/v3.0.0
[1.4.0]: https://github.com/foegit/sfcc-beaver/releases/tag/v3.0.0
[1.3.0]: https://github.com/foegit/sfcc-beaver/releases/tag/v3.0.0
[1.2.0]: https://github.com/foegit/sfcc-beaver/releases/tag/v3.0.0
[1.1.3]: https://github.com/foegit/sfcc-beaver/releases/tag/v3.0.0
[1.1.0]: https://github.com/foegit/sfcc-beaver/releases/tag/v3.0.0
[1.0.0]: https://github.com/foegit/sfcc-beaver/releases/tag/v3.0.0
