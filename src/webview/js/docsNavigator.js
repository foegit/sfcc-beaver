// @ts-check
import $ from 'cash-dom';
import { debounce } from './utils/debounce';

const vscode = acquireVsCodeApi();

const $searchStatusBar = $('.bv-search-status');
const $searchFeedbackElem = $('.bv-search-feedback');
const $resultElem = $('.bv-result');
const $searchForm = $('.bv-search-form');
const $searchInput = $('.bv-search-input');

let sameQueryEnterClicks = 0;

/** @param {boolean} isSameQuery */
function onEnterClick(isSameQuery) {
  if (isSameQuery) {
    sameQueryEnterClicks += 1;
  } else {
    sameQueryEnterClicks = 0;
  }

  if (sameQueryEnterClicks > 5) {
    return updateSearchFeedback('🦫 It is not gonna change anything unless you change something');
  }
}

/** @param {string} linkHref */
function showPage(linkHref) {
  vscode.postMessage({ type: 'beaver:webview:docs:showPage', linkHref: linkHref });
}

/** @param {string} query */
function getSearchResult(query) {
  vscode.postMessage({ type: 'beaver:webview:docs:search', query });
}

function triggerSearch() {
  const val = /** @type {string} */ ($searchInput.val());
  const { status, query } = getState();

  if (query === val) {
    return onEnterClick(true);
  }

  onEnterClick(false);
  setState({ query: val });

  if (val.length === 0) {
    return updateSearchFeedback('Type something to a new search');
  }

  if (status !== 'progress') {
    updateSearchFeedback('Searching...');
    getSearchResult(val);
    updateStatus('progress');
    setState({ status: 'progress' });
  }
}

/** @param {string} status */
function updateStatus(status) {
  setState({ status });
  $searchStatusBar.removeClass('success');
  $searchStatusBar.removeClass('progress');
  $searchStatusBar.removeClass('fail');
  $searchStatusBar.addClass(status);
}

/** @param {{ items: Array<{ url: string, title: string, subtitle?: string, description?: string, group?: 'api' | 'package' }> }} searchResult */
const updateResults = (searchResult) => {
  const apiItems = searchResult.items.filter((i) => i.group === 'api' || i.group === 'package');
  const others = searchResult.items.filter((i) => !i.group);

  /** @param {{ url: string, title: string }} i */
  const renderItem = (i) =>
    `<div class="bv-search-result-item">
      <a href="${i.url}" class="link">${i.title}</a>
    </div>`;

  const parts = [];
  if (apiItems.length) {
    parts.push('<div class="bv-result-group-label">API</div>');
    parts.push(...apiItems.map(renderItem));
  }
  if (others.length) {
    parts.push('<div class="bv-result-group-label">Other</div>');
    parts.push(...others.map(renderItem));
  }

  $resultElem.html(parts.join('\n'));
};

/**
 * @param {string} text
 * @param {boolean} [isError]
 */
const updateSearchFeedback = (text, isError) => {
  if (isError) {
    $searchFeedbackElem.addClass('error');
  } else {
    $searchFeedbackElem.removeClass('error');
  }

  $searchFeedbackElem.text(text);
};

/** @param {string} provider */
function switchProvider(provider) {
  vscode.postMessage({ type: 'beaver:webview:docs:switchProvider', provider });
}

function initListeners() {
  $searchInput.on('input', debounce(triggerSearch, 500));

  $(document).on('click', '.bv-provider-btn', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const btn = $(event.currentTarget);
    if (!btn.hasClass('active')) {
      setState({ lastHostData: '' });
      switchProvider(btn.data('provider'));
    }
  });

  $(document).on('click', 'a', (event) => {
    const clickedElement = $(event.currentTarget);

    event.preventDefault();
    event.stopPropagation();

    const href = clickedElement.attr('href');
    if (href) { showPage(href); }
  });

  $searchForm.on('submit', (event) => {
    event.preventDefault();
    triggerSearch();
  });

  // Handling host messages
  window.addEventListener('message', ({ data }) => {
    switch (data.type) {
      case 'beaver:host:docs:updateResults': {
        setState({ lastHostData: JSON.stringify(data) });
        handleHostResults(data);
      }
    }
  });
}

/** @param {{ error?: boolean, errorMsg?: string, data?: { msg: string, items: Array<{ url: string, title: string, group?: 'api' | 'package' }> } }} data */
function handleHostResults(data) {
  if (data.error) {
    updateSearchFeedback(data.errorMsg ?? 'Unknown error', true);
    updateStatus('fail');
  } else if (data.data) {
    console.log(data);
    updateResults(data.data);
    updateStatus('success');
    updateSearchFeedback(data.data.msg);
  }
}

/** @param {Record<string, unknown>} newState */
function setState(newState) {
  const currentState = /** @type {Record<string, unknown>} */ (vscode.getState() ?? {});

  vscode.setState({ ...currentState, ...newState });
}

function getState() {
  const currentState = /** @type {Record<string, unknown> | null} */ (vscode.getState());

  const defaultState = {
    query: '',
    status: 'none',
    lastHostData: '',
  };

  if (currentState) {
    return { ...defaultState, ...currentState };
  }

  setState(defaultState);

  return defaultState;
}

function init() {
  initListeners();

  if (document.body.dataset.indexing) {
    updateSearchFeedback('Indexing documentation...');
    updateStatus('progress');
    return;
  }

  setState({ status: 'none' });

  const currentState = getState();

  $searchInput.val(currentState.query);

  if (!currentState.query) {
    return;
  }

  if (currentState.lastHostData) {
    try {
      const savedData = JSON.parse(currentState.lastHostData);

      return handleHostResults(savedData);
    } catch (err) {
      console.error(`Error happened during parsing of cached data: ${err}`);            
      setState({ lastHostData: '' }); // restoring it to default state
    }
  }

  // bypass the same-query guard in triggerSearch — state.query already equals input val
  updateSearchFeedback('Searching...');
  getSearchResult(currentState.query);
  updateStatus('progress');
}

init();
