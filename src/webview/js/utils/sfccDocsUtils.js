import $ from 'cash-dom';
import normalizeUrl from 'normalize-url';

export function getFullURL(href) {
    const currentURL = $('.bv-open-in-browser').attr('href').replace(/\/[\w]*\.html/, '');

    return normalizeUrl(`${currentURL}/${href}`);
}
