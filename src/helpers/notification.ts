import { window } from 'vscode';

export function showNotification(notification: string) {
    window.showInformationMessage(notification);
}
