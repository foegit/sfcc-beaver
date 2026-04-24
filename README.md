<div align="center">

<img src="static/simpleLogo.png" alt="SFCC Beaver" width="64" />

# SFCC Beaver

_A VS Code extension for Salesforce Commerce Cloud developers_

_Override files, explore hooks, and search docs — without leaving your editor_

[![VS Marketplace](https://custom-icon-badges.demolab.com/badge/VS_Marketplace-SFCC_Beaver-1ae?style=flat)](https://marketplace.visualstudio.com/items?itemName=SerhiiHlavatskyi.sfcc-beaver)
[![Stand With Ukraine](https://custom-icon-badges.demolab.com/badge/Stand_With-Ukraine-FFD700?style=flat&labelColor=005BBB)](https://stand-with-ukraine.pp.ua)

</div>

## Features

- Quick File **Override** — override files from one cartridge to another
- File Require **Extract** — reliable alternative to path auto-completion for `.js`, `.isml`, `.properties`
- **Hooks** Support — overview, search, filter, and validation for SFCC hooks
- **Documentation** Support — built-in documentation search with improved UI

## Compatibility

Designed and tested for **SFRA** projects.

[![macOS](https://img.shields.io/badge/Mac-000000?logo=apple&logoColor=F0F0F0)](#)
[![Windows](https://custom-icon-badges.demolab.com/badge/Windows-0078D6?logo=windows11&logoColor=white)](#) 

## Usage

### Extract / Override

Use the top VS Code panel to create a copy of the active file in another cartridge: ![alt text](static/extract.png)

Or copy the current file path to the clipboard:
 ![alt text](static/override.png)

![alt text](static/overrideExtractExample.png)

> 💡 You can also use the Command Palette for quicker access. See below.

### Commands

Open the Command Palette (`F1` or `Ctrl + Shift + P`) and enter a command name:

- **▰ Extract** — copies a require/include/resource reference to the clipboard depending on file type:
  - Script: `var fileName = require('*/filePath')`
  - Template: `<isinclude template='templatePath' />`
  - Properties: `Resource.msg('{activeLinePropName}', '{fileName}', null)`
- **▰ Copy Unix Path** — copies the file path relative to the project root
- **▰ Override** — overrides the current file to another cartridge

### Beaver Dam

Beaver adds a sidebar panel called **Beaver Dam** with three sections:

#### Cartridges

Active cartridge list. Pin or unpin cartridges for overriding, and exclude them from VS Code global search.

#### Documentation

Browse SFCC API docs and Infocenter directly in your editor.

![alt text](static/documentation.png)

**Two documentation sources via tabs:**
- **API** — Official B2C Developer Docs (`salesforcecommercecloud.github.io`), indexed locally with 24h cache refresh
- **Infocenter (Retired)** — Legacy SFCC Learning portal (`sfcclearning.com`)

**Search:**
- Results grouped by **Classes** and **Packages** with VS Code icons
- Slash notation normalised: `dw/experience/PageMgr` treated as `dw.experience.PageMgr`
- Empty state and no-results state with direct links to the corresponding docs site
- Error handling with retry button when API index can't be fetched

**Viewer:**
- Back/forward navigation
- Quick link copy
- Open in browser
- Improved tables and code block rendering
- Anchor navigation within pages

#### Hooks

_Tag Compact View:_

![alt text](static/hooksPreviewTags.png)

_List Full View:_

![alt text](static/hooksPreviewList.png)

- Overview of all hooks defined and used in the project
- Pin hooks for quick access
- Two view modes:
  - **List** — best for small collections
  - **Tag** — best for large collections
- **Search** — click the search icon or press `Ctrl + Shift + H` / `Command + Shift + H`

  > ⚠️ The Mac shortcut overrides the system Hide Window command. If you use that often, reassign it.

  ![hook search demo](static/hooksSearch.png)

- **Filter** — filter hooks by name

  ![hooks filter demo](static/hooksFilter.png)

- Quick navigation to hook implementations and definitions
- Hooks configuration validation

### Hovers

Hovering over an API class such as `require('dw/web/URLUtils')` shows an `▰ Open docs` tip. Clicking it opens the corresponding documentation topic.

### JSON Schemas

Schemas provide autocompletion and validation for:

- Hooks → `hooks.json`
- Job Steps → `steptypes.json`

## 👍 Recommendations

Install **[🦫 SFCC Beaver - Icons](https://marketplace.visualstudio.com/items?itemName=SerhiiHlavatskyi.sfcc-beaver-icons 'Open marketplace')** for SFCC-specific file icons.

## 📨 Feedback

Found a 🪲 bug or have a suggestion? Open an issue on GitHub: <https://github.com/foegit/sfcc-beaver/issues>

## Credits

- Badge Service: https://github.com/DenverCoder1/custom-icon-badges
- Documentation: https://sfcclearning.com/
