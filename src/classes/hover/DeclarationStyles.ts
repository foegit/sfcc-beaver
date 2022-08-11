import * as vscode from 'vscode';

export default class DeclarationStyles {
    static apiClassDecoration = vscode.window.createTextEditorDecorationType({
        borderWidth: '1px',
        borderStyle: 'dashed',
        overviewRulerColor: 'blue',
        borderSpacing: '2px',
        textDecoration: 'underline',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        after: {
            contentText: '^'
        },
        light: {
            // this color will be used in light color themes
            borderColor: 'darkblue'
        },
        dark: {
            // this color will be used in dark color themes
            borderColor: 'lightblue'
        }
    });
}
