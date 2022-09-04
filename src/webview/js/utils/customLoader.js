import * as $ from 'cash-dom';

const $customLoader = $('.bv-custom-loader-wrapper');

export const PROGRESS = 'progress';
export const SUCCESS = 'success';
export const FAIL = 'fail';

export function updateStatus (status) {
    $customLoader.removeClass(PROGRESS);
    $customLoader.removeClass(SUCCESS);
    $customLoader.removeClass(FAIL);
    $customLoader.addClass(status);
};
