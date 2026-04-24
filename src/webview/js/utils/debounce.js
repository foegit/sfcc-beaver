/**
 * @param {(...args: any[]) => void} callback
 * @param {number} wait
 */
export const debounce = (callback, wait) => {
    /** @type {number | null} */
    let timeoutId = null;
    return (/** @type {any[]} */ ...args) => {
        window.clearTimeout(timeoutId ?? undefined);
        timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
        }, wait);
    };
};
