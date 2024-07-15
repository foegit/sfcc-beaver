import { env } from 'vscode';
import { showNotification } from './notification';

/**
 * Copies s message to clipboard
 * @param message
 * @param showNotification - optional flag to show a notification with copied content, true by default
 */
export function copyToClipboard(message: string) {
    env.clipboard.writeText(message);
    showNotification(`🦫 Copied!\n${message}`);
}
