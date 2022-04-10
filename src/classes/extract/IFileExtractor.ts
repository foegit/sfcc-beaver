import * as vscode from 'vscode';
import SFCCFile from "../SFCCFile";

export default interface IFileExtractor {
    getSnippet(sfccFile: SFCCFile, activeEditor : vscode.TextEditor): string;
}