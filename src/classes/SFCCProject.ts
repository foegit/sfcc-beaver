import SFCCCartridge from "./SFCCCartridge";
import { glob } from "glob";
import * as fg from 'fast-glob';

import path = require("path");
import * as vscode from 'vscode';

import * as fs from 'fs';

export default class SFCCProject {
    constructor() {
        console.log('me created');
    }

    getCartridges(): SFCCCartridge[] {
        var a = __dirname;


        let cartridges : Array<SFCCCartridge> = [];

        if(vscode.workspace.workspaceFolders !== undefined) {
            let workspaceFolder = vscode.workspace.workspaceFolders[0];

            const directoryList = fs.readdirSync(workspaceFolder.uri.fsPath);

            const result = fg.sync('**/.project', {
                cwd: workspaceFolder.uri.fsPath,
                ignore: ['**/node_modules/**']
            });

            const regexp = /^.*<name>(.*)<\/name>.*$/m;

            cartridges = result.map(r => {
                const content = fs.readFileSync(path.resolve(workspaceFolder.uri.fsPath, r), 'utf8');
                const par = regexp.exec(content);
                const name = par ? par[1] : 'UNKNOWN';

                return new SFCCCartridge(name);
            });
        }

        return cartridges;
    }
}