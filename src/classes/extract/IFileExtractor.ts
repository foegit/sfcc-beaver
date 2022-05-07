import * as vscode from 'vscode';
import SFCCProjectFile from '../SFCCProjectFile';

interface IFileExtractor {
    getSnippet(sfccFile?: SFCCProjectFile, activeEditor?: vscode.TextEditor): string;
};

export default IFileExtractor;