import * as vscode from 'vscode';
import SFCCProject from '../SFCCProject';

interface IFileOverrider {
    override(activeEditor : vscode.TextEditor, sfccProject : SFCCProject) : void;
};

export default IFileOverrider;
