// @ts-nocheck

(function (){
    const vscode = acquireVsCodeApi();

    const showPage = (linkHref) => vscode.postMessage({ type: 'beaver:webview:docs:showPage', linkHref: linkHref });
    const getSearchResult = (query) => vscode.postMessage({ type: 'beaver:webview:docs:search', query });

    const resultElem = document.querySelector('.bv-result');
    const searchForm = document.querySelector('.bv-search-form');
    const searchInput = document.querySelector('.bv-search-input');

    resultElem.addEventListener('click', (event) => {
        const clickedElement = event.target;

        if (!clickedElement || !clickedElement.classList.contains('link')) {
            return;
        }

        showPage(clickedElement.getAttribute('href'));
    });

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        getSearchResult(searchInput.value);
    });

    // Handling host messages
    window.addEventListener('message', ({ data }) => {
        switch (data.type) {
            case 'beaver:host:docs:updateResults': {
                console.log(data);
                resultElem.innerHTML = data.data;
            }
        }
    });
})();

