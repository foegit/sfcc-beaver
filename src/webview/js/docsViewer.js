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

function handleLinkClick(href) {
  fireServerEvent('sfccBeaver:docsViewer:onLinkClick', {
    href,
  });
}

function handleAnchorLink(href) {
  $('.focused-by-anchor').removeClass('focused-by-anchor');

  const anchorId = href.replace(/^#/, '');

  const $namedLink = $(`[name="${anchorId}"]`);
  const $firstNamedLink = $($namedLink[0]);

  if ($firstNamedLink.length < 1) {
    const idEl = document.getElementById(anchorId);

    if (!idEl) {
      return;
    }

    idEl.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    return;
  }

  const $elSummaryItem = $firstNamedLink.closest('.summaryItem');

  if ($elSummaryItem.length > 0) {
    $elSummaryItem.addClass('focused-by-anchor');

    $elSummaryItem[0]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    return;
  }

  const $detailsItem = $firstNamedLink.closest('.detailItem');

  if ($detailsItem) {
    $detailsItem.addClass('focused-by-anchor');
    $detailsItem[0]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    return;
  }

  $namedLink[0]?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

function resetSelection() {
  var getSelectionResult = window.getSelection();

  if (getSelectionResult) {
    getSelectionResult.empty();
  }
}

function findCurrentPageAnchor(href) {
  if (href.startsWith('#')) {
    return href;
  }

  const [url, anchor] = href.split('#');

  if (!anchor) {
    return '';
  }

  const currentUrl = $openInBrowserBtn.attr('href');

  if (!currentUrl) {
    return '';
  }

  const [currentUrlWithoutAnchor] = currentUrl.split('#');

  return currentUrlWithoutAnchor === url ? anchor : '';
}

function initListeners() {
  $openInBrowserBtn.on('click', openExternalLink);

  $(document).on('click', 'a', (event) => {
    const $link = $(event.currentTarget);
    const href = $link.attr('href');

    event.preventDefault();
    event.stopPropagation();

    if (!href) {
      return;
    }

    const anchor = findCurrentPageAnchor(href);

    if (anchor) {
      console.log('We have an anchor here!!' + href);
      return handleAnchorLink(anchor);
    }

    handleLinkClick(href);
  });

  $(document).on('click', '.copy-code-btn', (event) => {
    fireServerEvent('sfccBeaver:docsViewer:copyToClipboard', {
      text: $(event.currentTarget).closest('.pre.codeblock').find('code').text(),
    });
  });

  let lastCodeElementClicked = {
    el: null,
    time: 0,
  };

  $(document).on('click', '.ph.codeph', (event) => {
    if (lastCodeElementClicked.el === event.currentTarget && Date.now() - lastCodeElementClicked.time < 500) {
      // double click
      fireServerEvent('sfccBeaver:docsViewer:copyToClipboard', {
        text: $(event.currentTarget).text(),
      });

      // remove selection that happens because of the double click
      resetSelection();
    }

    lastCodeElementClicked.el = event.currentTarget;
    lastCodeElementClicked.time = Date.now();
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
      case 'sfccBeaver:docsViewer:showProgress': {
        updateStatus(PROGRESS);
        return;
      }
      case 'sfccBeaver:docsViewer:stopProgress': {
        updateStatus(SUCCESS);
      }
    }
  });
}

function updateDetails(data) {
  setState({ lastHostData: JSON.stringify(data) });

  $details.html(data.html);
  $openInBrowserBtn.attr('href', data.originalURL);
  updateStatus(SUCCESS);

  const [, anchor] = data.originalURL.split('#');

  if (anchor) {
    handleAnchorLink(anchor);
  } else {
    window.scroll({
      top: 0,
      behavior: 'smooth',
    });
  }
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
