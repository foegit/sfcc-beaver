// Creates file content based on active file

import { TextEditor } from 'vscode';

interface IFileCreator {
    create(activeEditor?: TextEditor): string;
}

export default IFileCreator;