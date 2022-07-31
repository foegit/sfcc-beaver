# 🦫 SFCC Beaver

A beaver who is an experienced developer (including his dam) will help you with your work routine

## Features

💡 Please keep in mind, Beaver fully supports only SFRA projects. However, some of the feature are compatible with SiteGen.

### ⭐ Overview

This extension provides a set of command to automate routine tasks. To activate command press `F1` or `Ctrl + Shift + P` and start typing name of the command:

- **🦫 sf extract** command
  - get a require of active script file
  - get an isinclude of active template file
  - get a call of Resource.msg for open .properties file
- **🦫 unix path** command
  - get a path of your file related to the project root
- **🦫 sf override** command
  - override active file to another cartridge

### 🪚 Extract

Depends on the file type, you can automatically extract an import statement for this file.

1. Open a file you need to import
    - For resources, focus cursor on property you want to use
2. Call _sf extract_ and appropriate import will be copied to the clipboard:
    - `var fileName = require({filePath});` for JavaScript, JSON files
    - `<isinclude template='{templatePath}' />` for ISML file
    - `Resource.msg('{activeLinePropName}', '{fileName}', null)` for .properties files

### 🪵 Override

Depends on the file type, you can automatically override a file to another cartridge

1. Open file you need to override
    - For resources, focus cursor on property you want to use
2. Call _sf extract_ and Beaver will override it for you

## Road Map

Beaver works hard helping you, but it also learns a lot of new stuff to help you even more:

- Smart autocomplete
- Creating commonly used templates like steptypes, an bm_extension, a controller, an entire cartridge, and a PD component
- Improve managing mate data

## 👍 Recommendations

Install the icons extension **[🦫 SFCC Beaver - Icons](https://marketplace.visualstudio.com/items?itemName=SerhiiHlavatskyi.sfcc-beaver-icons 'Open marketplace')** to make your project look better.

## 📨 Feedback

Found a 🪲bug or want to improve something? Feel free to open an issue on GitHub: <https://github.com/foegit/sfcc-beaver/issues>
