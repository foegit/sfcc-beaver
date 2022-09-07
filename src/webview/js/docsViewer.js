// @ts-check


import $ from 'cash-dom';
import { updateStatus, SUCCESS, PROGRESS } from './utils/customLoader';
import { getFullURL } from './utils/sfccDocsUtils';

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

function loadLink(url) {
    updateStatus(PROGRESS);
    vscode.postMessage({type: 'beaver:client:docs:loadLink', url });
}

function handleAnchorLink(href) {
    const $element = $(`[name="${href.replace(/^#/, '')}"]`);
    $element[0]?.scrollIntoView();
}

function initListeners() {
    $openInBrowserBtn.on('click', () => {
        openExternalLink($openInBrowserBtn.attr('href'));
    });

    $(document).on('click', 'a', (event) => {
        const $link = $(event.currentTarget);
        const href = $link.attr('href');

        if (href?.startsWith('#')) {
            // anchor
            console.log('We have an anchor here!!' + href);
            return handleAnchorLink(href);
        }

        if (href?.startsWith('http')) {
            // anchor
            return;
        }


        if (href) {
            loadLink(getFullURL(href));
        }
    });

    window.addEventListener('message', ({ data }) => {
        switch (data.type) {
            case 'beaver:host:docs:updateDetails': {
                updateDetails(data);
                return;
            }
            case 'beaver:host:docs:startLoading': {
                console.log('loading started');
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
