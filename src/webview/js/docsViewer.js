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
    lastHostData: '',
  };

  if (currentState) {
    return { ...defaultState, ...currentState };
  }

  setState(defaultState);

  return defaultState;
}

function fireServerEvent(type, data) {
  console.log(`Fire ${type} event with ${JSON.stringify(data)} data`);

  vscode.postMessage({
    type,
    data,
  });
}

function openExternalLink() {
  fireServerEvent('sfccBeaver:docsViewer:openInBrowser');
}

function initHistory(url) {
  fireServerEvent('sfccBeaver:docsViewer:initHistory', {
    url,
  });
}

function goBack() {
  fireServerEvent('sfccBeaver:docsViewer:goBack');
}

function goForward() {
  fireServerEvent('sfccBeaver:docsViewer:goForward');
}

function openLink(href) {
  fireServerEvent('sfccBeaver:docsViewer:onLinkClick', {
    href,
  });
}

function handleAnchorLink(href) {
  const $element = $(`[name="${href.replace(/^#/, '')}"]`);
  $element[0]?.scrollIntoView();
}

function initListeners() {
  $openInBrowserBtn.on('click', openExternalLink);

  $(document).on('click', 'a', (event) => {
    const $link = $(event.currentTarget);
    const href = $link.attr('href');
    event.preventDefault();
    event.stopPropagation();

    if (href?.startsWith('#')) {
      // anchor
      console.log('We have an anchor here!!' + href);
      return handleAnchorLink(href);
    }

    if (href) {
      openLink(href);
    }
  });

  $(document).on('click', '.copy-code-btn', (event) => {
    fireServerEvent('sfccBeaver:docsViewer:copyToClipboard', {
      text: $(event.currentTarget).closest('.pre.codeblock').find('code').text(),
    });
  });

  $(document).on('mouseup', (event) => {
    // Mouse side buttons
    if (event.button === 3) {
      goBack();
    } else if (event.button === 4) {
      goForward();
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
  window.scroll({
    top: 0,
    behavior: 'smooth',
  });
}

function init() {
  initListeners();

  const currentState = getState();

  if (currentState.lastHostData) {
    try {
      const savedData = JSON.parse(currentState.lastHostData);

      updateDetails(savedData);
      if (savedData.originalURL) {
        initHistory(savedData.originalURL);
      }
    } catch (err) {
      console.error(`Error happened during parsing of cached data: ${err}`);
      setState({ lastHostData: '' }); // restoring it to default state
    }
  } else {
    updateStatus(SUCCESS);
  }
}

init();
