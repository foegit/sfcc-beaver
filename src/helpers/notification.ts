import { window } from 'vscode';

type Action = {
  title: string;
  cb: () => any;
};

export function showNotification(notification: string) {
  window.showInformationMessage(notification);
}

export async function showError(notification: string, actions?: Action[]) {
  if (!actions) {
    return window.showErrorMessage(notification);
  }

  const result = await window.showErrorMessage(notification, ...actions.map((a) => a.title));

  if (result) {
    const action = actions.find((a) => a.title === result);

    if (action) {
      action.cb();
    }
  }
}
