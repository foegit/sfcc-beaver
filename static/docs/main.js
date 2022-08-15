// @ts-nocheck
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

// (function () {
//     const vscode = acquireVsCodeApi();

//     const oldState = /** @type {{ count: number} | undefined} */ (vscode.getState());

//     const counter = /** @type {HTMLElement} */ (document.getElementById('lines-of-code-counter'));
//     console.log('Initial state', oldState);

//     let currentCount = (oldState && oldState.count) || 0;
//     counter.textContent = `${currentCount}`;

//     setInterval(() => {
//         counter.textContent = `${currentCount++} `;

//         // Update state
//         vscode.setState({ count: currentCount });

//         // Alert the extension when the cat introduces a bug
//         if (Math.random() < Math.min(0.001 * currentCount, 0.05)) {
//             // Send a message back to the extension
//             vscode.postMessage({
//                 command: 'alert',
//                 text: '🐛  on line ' + currentCount
//             });
//         }
//     }, 100);

//     // Handle messages sent from the extension to the webview
//     window.addEventListener('message', event => {
//         const message = event.data; // The json data that the extension sent
//         switch (message.command) {
//             case 'refactor':
//                 currentCount = Math.ceil(currentCount * 0.5);
//                 counter.textContent = `${currentCount}`;
//                 break;
//         }
//     });
// }());

(async function (){
    const vscode = acquireVsCodeApi();

    const searchBtn = document.querySelector('.bv-doc-search-btn');
    const searchInput = document.querySelector('.bv-doc-search-input');
    const searchOutput = document.querySelector('.bv-search-results');


    if (searchBtn && searchInput && searchOutput) {
        searchBtn.addEventListener('click', event => {
            vscode.postMessage({
                command: 'search',
                text: searchInput.value
            });
        });
    }

    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case 'updateResults':
                searchOutput.innerHTML = message.data;
                break;
        }
    });
}())
