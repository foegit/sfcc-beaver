import { window } from 'vscode';

export function showNotification(notification: string) {
  window.showInformationMessage(notification);
}

export function showError(notification: string) {
  window.showErrorMessage(notification, { title: 'Error! ' });
}
