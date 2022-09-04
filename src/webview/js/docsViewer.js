// @ts-check


import $ from 'cash-dom';
import { updateStatus, SUCCESS, PROGRESS } from './utils/customLoader';

const $details = $('.bv-details-content');
const $openInBrowserBtn = $('.bv-open-in-browser');

const vscode = acquireVsCodeApi();

function setState(newState) {
    const currentState = vscode.getState() || {};

    vscode.setState({ ...currentState, ...newState });
}


function getState() {
    const currentState = vscode.getState();

    const defaultState = {
        lastHostData: ''
    };


    if (currentState) {
        return { ...defaultState, ...currentState };
    }

    setState(defaultState);

    return defaultState;

}

function openExternalLink(url) {
    vscode.postMessage({type: 'beaver:host:docs:openExternalLink', url });
}

function initListeners() {
    $openInBrowserBtn.on('click', () => {
        openExternalLink($openInBrowserBtn.attr('href'));
    });

    window.addEventListener('message', ({ data }) => {
        switch (data.type) {
            case 'beaver:host:docs:updateDetails': {
                updateDetails(data);
                return;
            }
            case 'beaver:host:docs:startLoading': {
                updateStatus(PROGRESS);
            }
        }
    });
}

function updateDetails(data) {
    setState({ lastHostData: JSON.stringify(data) });

    $details.html(data.html);
    $openInBrowserBtn.attr('href', data.originalURL);
    updateStatus(SUCCESS);
}

function init() {
    initListeners();

    const currentState = getState();

    if (currentState.lastHostData) {
        try {
            const savedData = JSON.parse(currentState.lastHostData);

            return updateDetails(savedData);
        } catch (err) {
            console.error(`Error happened during parsing of cached data: ${err}`);
            setState({ lastHostData: '' }); // restoring it to default state
        }
    } else {
        updateStatus(SUCCESS);
    }
}

init();
