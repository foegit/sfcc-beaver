// @ts-check
import $ from 'cash-dom';
import { debounce } from './utils/debounce';

/** @type {{ getState(): any, setState(s: any): void, postMessage(m: any): void }} */
const vscode = /** @type {any} */ (window)['acquireVsCodeApi']();

const $searchStatusBar = $('.bv-search-status');
const $resultElem = $('.bv-result');
const $searchForm = $('.bv-search-form');
const $searchInput = $('.bv-search-input');

const DOCS_URLS = {
  api: 'https://salesforcecommercecloud.github.io/b2c-dev-doc/',
  olddocs: 'https://sfcclearning.com/infocenter/',
};

const DOCS_LABELS = {
  api: 'salesforcecommercecloud.github.io',
  olddocs: 'sfcclearning.com',
};

function getDocsLinkHtml() {
  const { activeTab } = getState();
  const tab = /** @type {keyof typeof DOCS_URLS} */ (activeTab) in DOCS_URLS ? /** @type {keyof typeof DOCS_URLS} */ (activeTab) : 'api';
  return `<a href="${DOCS_URLS[tab]}" class="link bv-error-link bv-external-link"><span class="codicon codicon-link-external"></span> ${DOCS_LABELS[tab]}</a>`;
}

let sameQueryEnterClicks = 0;

/** @param {boolean} isSameQuery */
function onEnterClick(isSameQuery) {
  if (isSameQuery) {
    sameQueryEnterClicks += 1;
  } else {
    sameQueryEnterClicks = 0;
  }

  if (sameQueryEnterClicks > 5) {
    renderErrorBlock('🦫 It is not gonna change anything unless you change something');
  }
}

/** @param {string} linkHref */
function showPage(linkHref) {
  vscode.postMessage({ type: 'beaver:webview:docs:showPage', linkHref });
}

/**
 * @param {string} query
 * @param {string} tab
 */
function getSearchResult(query, tab) {
  vscode.postMessage({ type: 'beaver:webview:docs:search', query, tab });
}

function triggerSearch() {
  const val = /** @type {string} */ ($searchInput.val());
  const { status, query, activeTab } = getState();

  if (query === val) {
    return onEnterClick(true);
  }

  onEnterClick(false);
  setState({ query: val });

  if (val.length === 0) {
    renderEmptyState();
    return;
  }

  if (activeTab === 'olddocs' && val.length < 3) {
    renderShortQueryHint();
    return;
  }

  if (status !== 'progress') {
    getSearchResult(val, /** @type {string} */ (activeTab) || 'api');
    updateStatus('progress');
    setState({ status: 'progress' });
  }
}

/** @param {string} status */
function updateStatus(status) {
  setState({ status });
  $searchStatusBar.removeClass('success progress fail');
  $searchStatusBar.addClass(status);
}

/** @param {{ items: Array<{ url: string, title: string, group?: 'api' | 'package' }> }} searchResult */
const updateResults = (searchResult) => {
  if (searchResult.items.length === 0) {
    const { query } = getState();
    renderNoResults(/** @type {string} */ (query));
    return;
  }

  const classes = searchResult.items.filter((i) => i.group === 'api');
  const packages = searchResult.items.filter((i) => i.group === 'package');
  const others = searchResult.items.filter((i) => !i.group);

  /** @param {{ url: string, title: string, group?: string }} i */
  const renderItem = (i) => {
    const icon = i.group === 'api' ? 'codicon-symbol-class' : i.group === 'package' ? 'codicon-package' : 'codicon-search';
    const title = i.group === 'api' ? i.title.replace(/^Class\s+/, '') : i.title;
    return `<div class="bv-search-result-item">
      <a href="${i.url}" class="link">${icon ? `<span class="codicon ${icon}"></span> ` : ''}<span class="bv-link-text">${title}</span></a>
    </div>`;
  };

  const hasGroups = classes.length > 0 || packages.length > 0;
  const parts = [];

  if (classes.length) {
    parts.push('<div class="bv-result-group-label">Classes</div>');
    parts.push(...classes.map(renderItem));
  }
  if (packages.length) {
    parts.push('<div class="bv-result-group-label">Packages</div>');
    parts.push(...packages.map(renderItem));
  }
  if (others.length) {
    parts.push(`<div class="bv-result-group-label">${hasGroups ? 'Other' : 'Results'}</div>`);
    parts.push(...others.map(renderItem));
  }

  $resultElem.html(parts.join('\n'));
};

/**
 * @param {string} message
 * @param {string} [docsLink]
 */
const renderErrorBlock = (message, docsLink) => {
  $resultElem.html(
    `<div class="bv-error-block">
      <div class="bv-error-msg">${message}</div>
      ${docsLink ? `<a href="${docsLink}" class="link bv-error-link bv-external-link"><span class="codicon codicon-link-external"></span> Open documentation site</a>` : ''}
    </div>`
  );
};

const renderShortQueryHint = () => {
  $resultElem.html(
    `<div class="bv-error-block">
      <div class="bv-no-results-msg">Enter at least 3 characters to search Infocenter</div>
      ${getDocsLinkHtml()}
    </div>`
  );
};

const renderEmptyState = () => {
  $resultElem.html(
    `<div class="bv-error-block">
      <div class="bv-no-results-msg">Enter a query to search documentation</div>
      <div class="bv-no-results-hint">Or browse the docs directly</div>
      ${getDocsLinkHtml()}
    </div>`
  );
};

/** @param {string} query */
const renderNoResults = (query) => {
  $resultElem.html(
    `<div class="bv-error-block">
      <div class="bv-error-msg bv-no-results-msg">No results for <strong>${query}</strong></div>
      <div class="bv-no-results-hint">Try a different query or browse the docs directly</div>
      ${getDocsLinkHtml()}
    </div>`
  );
};

const renderIndexError = () => {
  $resultElem.html(
    `<div class="bv-error-block">
      <div class="bv-error-msg">Failed to fetch API docs. Please check your connection.</div>
      <button class="bv-reindex-btn">Retry</button>
    </div>`
  );
};

const renderIndexWarning = () => {
  const existing = $resultElem.find('.bv-index-warning');
  if (existing.length) { return; }
  $resultElem.prepend(
    `<div class="bv-index-warning">
      Could not refresh API docs. Showing cached version.
      <button class="bv-reindex-btn">Retry</button>
    </div>`
  );
};

function triggerReindex() {
  vscode.postMessage({ type: 'beaver:webview:docs:reindex' });
  $resultElem.html(
    `<div class="bv-error-block bv-indexing">
      <div class="bv-error-msg">Fetching API docs...</div>
    </div>`
  );
  updateStatus('progress');
}

function initListeners() {
  $searchInput.on('input', debounce(triggerSearch, 500));

  $(document).on('click', '.bv-tab', (event) => {
    event.preventDefault();
    const btn = $(event.currentTarget);
    if (btn.hasClass('active')) { return; }

    $('.bv-tab').removeClass('active');
    btn.addClass('active');

    const tab = /** @type {string} */ (btn.data('tab'));
    setState({ activeTab: tab });

    const val = /** @type {string} */ ($searchInput.val());
    if (!val) { renderEmptyState(); return; }
    if (tab === 'olddocs' && val.length < 3) { renderShortQueryHint(); return; }

    const cachedStr = /** @type {string | undefined} */ ((/** @type {Record<string, unknown>} */ (getState()))[`${tab}Cache`]);
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr);
        if (cached.query === val) {
          handleHostResults(cached.hostData);
          return;
        }
      } catch (_) { /* ignore */ }
    }

    $resultElem.html('');
    getSearchResult(val, tab);
    updateStatus('progress');
  });

  $(document).on('click', '.bv-reindex-btn', () => {
    triggerReindex();
  });

  $(document).on('click', 'a', (event) => {
    const clickedElement = $(event.currentTarget);
    event.preventDefault();
    event.stopPropagation();
    const href = clickedElement.attr('href');
    if (!href) { return; }
    if (clickedElement.hasClass('bv-external-link')) {
      vscode.postMessage({ type: 'beaver:webview:docs:openExternal', href });
    } else {
      showPage(href);
    }
  });

  $searchForm.on('submit', (event) => {
    event.preventDefault();
    triggerSearch();
  });

  window.addEventListener('message', ({ data }) => {
    switch (data.type) {
      case 'beaver:host:docs:updateResults': {
        handleHostResults(data);
        break;
      }
      case 'beaver:host:docs:indexError': {
        renderIndexError();
        updateStatus('fail');
        break;
      }
      case 'beaver:host:docs:indexWarning': {
        renderIndexWarning();
        break;
      }
      case 'beaver:host:docs:reindexStart': {
        updateStatus('progress');
        break;
      }
      case 'beaver:host:docs:reindexDone': {
        updateStatus('success');
        const { query, activeTab } = getState();
        if (query) {
          getSearchResult(/** @type {string} */ (query), /** @type {string} */ (activeTab) || 'api');
        }
        break;
      }
    }
  });
}

/** @param {{ error?: boolean, errorMsg?: string, errorLink?: string, data?: { items: Array<{ url: string, title: string, group?: 'api' | 'package' }> } }} data */
function handleHostResults(data) {
  if (data.error) {
    renderErrorBlock(data.errorMsg ?? 'Unknown error', data.errorLink);
    updateStatus('fail');
  } else if (data.data) {
    updateResults(data.data);
    updateStatus('success');
    const { activeTab, query } = getState();
    setState({ [`${activeTab}Cache`]: JSON.stringify({ query, hostData: data }) });
  }
}

/** @param {Record<string, unknown>} newState */
function setState(newState) {
  const currentState = /** @type {Record<string, unknown>} */ (vscode.getState() ?? {});
  vscode.setState({ ...currentState, ...newState });
}

function getState() {
  const currentState = /** @type {Record<string, unknown> | null} */ (vscode.getState());
  const defaultState = { query: '', status: 'none', activeTab: 'api' };

  if (currentState) {
    return { ...defaultState, ...currentState };
  }

  setState(defaultState);
  return defaultState;
}

function init() {
  initListeners();

  const currentState = getState();
  $(`.bv-tab[data-tab="${currentState.activeTab}"]`).addClass('active');

  if (document.body.dataset.indexing) {
    updateStatus('progress');
    return;
  }

  setState({ status: 'none' });
  $searchInput.val(currentState.query);

  if (!currentState.query) { renderEmptyState(); return; }

  const activeTab = /** @type {string} */ (currentState.activeTab) || 'api';
  const cachedStr = /** @type {string | undefined} */ ((/** @type {Record<string, unknown>} */ (currentState))[`${activeTab}Cache`]);
  if (cachedStr) {
    try {
      const cached = JSON.parse(cachedStr);
      if (cached.query === currentState.query) {
        return handleHostResults(cached.hostData);
      }
    } catch (_) { /* ignore */ }
  }

  getSearchResult(/** @type {string} */ (currentState.query), activeTab);
  updateStatus('progress');
}

init();
