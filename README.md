# 🦫 SFCC Beaver

It is a VS Code extension that automates routine tasks for SFCC Developer.

**The key features are:**

- 🪜 **Override Files**
With `override` command you can copy (override) the currently opened file to another cartridge.

- 📚 **Copy Paths**
With `extract` command you can copy (extract) needed resource such as script file, ISML template or resource message to clipboard and paste it to the place where you need it.
Also you can copy full unix-like path of the file which may be useful when sharing things with a team.

- 🔎 **Search in Documentation**
Search in SFCC documentation without leaving VS Code. You can also share a link or open in browser a particular topic.

> **💡Compatibility**
Beaver fully supports only SFRA projects. However, some of the feature are compatible with SiteGen as well.

## ⭐ Usage

Once installed, you can start using Beaver features.

### Commands

Beaver adds to VS Code few commands. To trigger a command you need to open command pallette (press `F1` or `Ctrl + Shift + P`) and enter the command name.

- **🦫 Extract** command copies to clipboard require of the file depends on type.
  - for script (JS) file copy require: `var fileName = require('*/filePath')`
  - for template (ISML) file copy isinclude: `<isinclude template='templatePath' />`
  - for resource (PROPERTIES) file copy active line as `Resource.msg('{activeLinePropName}', '{fileName}', null)`

- **🦫 Unix path** command copies file path relatively to the project root folder.
- **🦫 Override** command overrides current file to another cartridge

### Beaver Dam

Beaver introduces a new panel called Beaver Dam. There two items:

- **Cartridges** is a active cartridge list where you can pin/unpin cartridge for overriding.
- **Documentation**. There you can search in SFCC docs without leaving VS Code.

### Hovers

If you hover over the API class such as `require('dw/web/URLUtils')` you see a tip with `🦫 Open docs` suggestion. Clicking it will open appropriate documentation topic.

## 👍 Recommendations

Install the icons extension **[🦫 SFCC Beaver - Icons](https://marketplace.visualstudio.com/items?itemName=SerhiiHlavatskyi.sfcc-beaver-icons 'Open marketplace')** to make your project look better.

## 📨 Feedback

Found a 🪲bug or want to improve something? Feel free to open an issue on GitHub: <https://github.com/foegit/sfcc-beaver/issues>
