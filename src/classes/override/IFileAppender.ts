// Creates file content based on active file

import { TextEditor } from 'vscode';

interface IFileAppender {
    append(activeEditor?: TextEditor): string;
}

export default IFileAppender;