import * as vscode from 'vscode';
import SFCCFile from '../SFCCFile';

interface IFileExtractor {
    getSnippet(sfccFile: SFCCFile, activeEditor : vscode.TextEditor): string;
};

export default IFileExtractor;