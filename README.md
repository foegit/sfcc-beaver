# 🦫 SFCC Beaver

**Swiss-knife extension for SFCC developers!**

## Features

- Overriding files from one cartridge to another
- Copying/extracting file path/require/include into clipboard so it can be quickly inserted to other file
- Overview of all project hooks
- Documentation support
  - 🤒 Documentation search temporary is not working due to documentation portal changes.

## Compatibility

> Extension fully supports only SFRA projects. However, some of the features are compatible with SiteGen as well.

## Usage

### Extract/Override

Use top VS Code panel to easily create a copy of an active file in another cartridge ![alt text](static/extract.png)

or copy current file path into clipboard ![alt text](static/override.png)

![alt text](static/overrideExtractExample.png)

> 💡 You can use Command Pallette to do it even quicker.

### Commands

Beaver adds several new commands that you can run manually.

To run a command you need to open the command pallette (press `F1` or `Ctrl + Shift + P`) and enter the command name.

- **▰ Extract** Swiss-kni command copies to clipboard require of the file depends on type.
  - for scripts file copy require: `var fileName = require('*/filePath')`
  - for templates file copy isinclude: `<isinclude template='templatePath' />`
  - for resource properties file copy active line as `Resource.msg('{activeLinePropName}', '{fileName}', null)`
- **▰ Copy unix path** command copies file path relatively to the project root folder.
- **▰ Override** command overrides current file to another cartridge

### Beaver Dam

Beaver introduces a new side section called Beaver Dam. There are two items currently:

#### **# Cartridges**

is a active cartridge list where you can pin/unpin cartridge for overriding.

#### **# Documentation**

Search in docs without leaving VS Code. Currently not working.

#### **# Hooks**

_Tag Compact View:_
![alt text](static/hooksPreviewTags.png)

_List Full View:_
![alt text](static/hooksPreviewList.png)

- Provides an overview of all project hooks
- Hooks can be pinned
- Two view mode:

  - List mode best for small collections of hooks
  - Tag mode best for big collections

- Quick navigation to hooks implementation/definition
- Bad configuration detection

### Hovers

If you hover over the API class such as `require('dw/web/URLUtils')` you see a tip with `▰ Open docs` suggestion. Clicking it will open corresponding documentation topic.

## 👍 Recommendations

Install the icons extension **[🦫 SFCC Beaver - Icons](https://marketplace.visualstudio.com/items?itemName=SerhiiHlavatskyi.sfcc-beaver-icons 'Open marketplace')** to have SFCC-specific icons.

## 📨 Feedback

Found a 🪲bug or want to improve something? Feel free to open an issue on GitHub: <https://github.com/foegit/sfcc-beaver/issues>
