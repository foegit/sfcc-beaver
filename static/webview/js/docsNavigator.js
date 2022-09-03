// @ts-nocheck

(function (){
    const vscode = acquireVsCodeApi();

    const debounce = (callback, wait) => {
        let timeoutId = null;
        return (...args) => {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
            callback.apply(null, args);
            }, wait);
        };
    };

    const searchStatusBar = document.querySelector('.bv-search-status');
    const searchFeedbackElem = document.querySelector('.bv-search-feedback');
    const resultElem = document.querySelector('.bv-result');
    const searchForm = document.querySelector('.bv-search-form');
    const searchInput = document.querySelector('.bv-search-input');

    let searchStatus = 'none';

    const showPage = (linkHref) => vscode.postMessage({ type: 'beaver:webview:docs:showPage', linkHref: linkHref });
    const getSearchResult = (query) => vscode.postMessage({ type: 'beaver:webview:docs:search', query });
    const triggerSearch = () => {
        if (searchStatus !== 'progress') {
            updateSearchFeedback('Searching...');
            getSearchResult(searchInput.value);
            updateStatus('progress');
        }
    };

    const updateStatus = (status) => {
        searchStatus = status;
        searchStatusBar.classList.remove('success');
        searchStatusBar.classList.remove('progress');
        searchStatusBar.classList.remove('fail');
        searchStatusBar.classList.add(status);
    };

    const updateSearchFeedback = (text, isError) => {
        if (isError) {
            searchFeedbackElem.classList.add('error');
        } else {
            searchFeedbackElem.classList.remove('error');
        }

        searchFeedbackElem.innerHTML = text;
    };


    searchInput.addEventListener('input', debounce(event => {
        triggerSearch();
    }, 500));

    resultElem.addEventListener('click', (event) => {
        const clickedElement = event.target;

        if (!clickedElement || !clickedElement.classList.contains('link')) {
            return;
        }

        showPage(clickedElement.getAttribute('href'));
    });

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        triggerSearch();
    });

    // Handling host messages
    window.addEventListener('message', ({ data }) => {
        switch (data.type) {
            case 'beaver:host:docs:updateResults': {
                if (data.error) {
                    updateSearchFeedback(data.message, true);
                    updateStatus('fail');
                } else {
                    resultElem.innerHTML = data.data.html;
                    updateStatus('success');
                    updateSearchFeedback(data.data.message);
                }
            }
        }
    });
})();

