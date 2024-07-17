import PathTool from './PathTool';
import { Selection, TextDocumentShowOptions, TextEditorRevealType, Uri, window, workspace } from 'vscode';
import FsTool from './FsTool';

type FocusOptions = TextDocumentShowOptions & { focusOnText?: RegExp };

export default class EditorTool {
  static async focusOnWorkspaceFile(relativePath: string, options: FocusOptions = {}) {
    const folder = FsTool.getCurrentWorkspaceFolder();
    const absPath = PathTool.getAbsPosixPath(folder, relativePath);

    return EditorTool.focusOnFile(absPath, options);
  }

  static async focusOnFile(absFilePath: string, options: FocusOptions = {}) {
    const fileUri = Uri.file(absFilePath);
    const textDocument = await workspace.openTextDocument(fileUri);

    await window.showTextDocument(textDocument, options);

    const activeEditor = window.activeTextEditor;

    if (options.focusOnText && activeEditor) {
      const searchResult = options.focusOnText.exec(textDocument.getText());

      if (searchResult) {
        // converting the index from RegExp to position e.g. 133 -> { line: 29, char: 5 }
        const position = textDocument.positionAt(searchResult.index);

        const range = activeEditor.document.lineAt(position.line).range;
        // changing focus (cursor) to new position
        activeEditor.selection = new Selection(position, position);
        activeEditor.revealRange(range, TextEditorRevealType.AtTop);
      }
    }

    return textDocument;
  }
}
