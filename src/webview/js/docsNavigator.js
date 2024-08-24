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

function showPage(linkHref) {
  vscode.postMessage({ type: 'beaver:webview:docs:showPage', linkHref: linkHref });
}

function getSearchResult(query) {
  vscode.postMessage({ type: 'beaver:webview:docs:search', query });
}

function triggerSearch() {
  const val = $searchInput.val();
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

function updateStatus(status) {
  setState({ status });
  $searchStatusBar.removeClass('success');
  $searchStatusBar.removeClass('progress');
  $searchStatusBar.removeClass('fail');
  $searchStatusBar.addClass(status);
}

const updateResults = (searchResult) => {
  $resultElem.html(
    searchResult.items
      .map(
        (i) =>
          `<div class="bv-search-result-item">
            <div class="bv-link-wrapper"><a href="${i.url}" class="link">${i.title}</a></div>

            ${i.subtitle ? `<small>${i.subtitle}</small>` : ''}

            <div>${i.description || ''}</div>
          </div>
                    `
      )
      .join('\n')
  );
};

const updateSearchFeedback = (text, isError) => {
  if (isError) {
    $searchFeedbackElem.addClass('error');
  } else {
    $searchFeedbackElem.removeClass('error');
  }

  $searchFeedbackElem.text(text);
};

function initListeners() {
  $searchInput.on('input', debounce(triggerSearch, 500));

  $(document).on('click', 'a', (event) => {
    const clickedElement = $(event.currentTarget);

    event.preventDefault();
    event.stopPropagation();

    showPage(clickedElement.attr('href'));
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

function handleHostResults(data) {
  if (data.error) {
    updateSearchFeedback(data.errorMsg, true);
    updateStatus('fail');
  } else {
    console.log(data);
    updateResults(data.data);
    updateStatus('success');
    updateSearchFeedback(data.data.msg);
  }
}

function setState(newState) {
  let currentState = vscode.getState() || {};

  vscode.setState({ ...currentState, ...newState });
}

function getState() {
  const currentState = vscode.getState();

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

  triggerSearch();
}

init();
