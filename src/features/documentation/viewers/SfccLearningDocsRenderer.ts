import { IDocsRenderer } from './IDocsRenderer';
import * as cheerio from 'cheerio';

export class SfccLearningDocsRenderer implements IDocsRenderer {
  async render(htmlResponse: string) {
    const $ = cheerio.load(htmlResponse);
    const $body = $('body');
    const title = $('title').text();
    // no scripts
    $body.find('script').remove();
    // remove footer
    $body.find('footer').remove();
    // remove navigation
    $body.find('aside').remove();
    // remove retirement footer
    $body.find('.retirement-footer').remove();
    $body.find('.home-container>.copy').remove();
    // remove nums visit banner
    $body.find('.numVisits').remove();
    // ocapi deprecation message, is outdated completely
    $body.find('#ocapiDeprecationBanner').remove();
    // remove favorites
    $body.find('.quick-links ul').first().remove();

    // TODO: double check
    $body.find('#cookieConsent').remove();
    $body.find('.copyright, .copyright_table').remove();
    $body.find('.banner').remove();
    $body.find('.packageName').remove();
    $body.find('.detailName').remove();
    $body.find('hr').remove();
    $body.find('a').removeAttr('target');

    const $hierarchy = $body.find('.hierarchy');

    if ($hierarchy.length > 0) {
      $hierarchy.find('img').remove();
    }

    const $breadcrumbs = $body.find('.help_breadcrumbs');

    if ($breadcrumbs.length > 0) {
      const $allBreadcrumbsLinks = $breadcrumbs.find('a');

      $breadcrumbs.empty();

      $allBreadcrumbsLinks.each((i, $el) => {
        $breadcrumbs.append($el);
        if ($allBreadcrumbsLinks.length !== i + 1) {
          $breadcrumbs.append(' / ');
        }
      });
    }

    $body.find('.pre.codeblock').each((i, $el) => {
      $($el).prepend('<span class="copy-code-btn">copy</span>');
    });

    $body.find('.header:contains("Method Summary")').closest('.section').remove();

    $body.append(`<div class="credit-note">
        Powered by
        <a href="https://sfcclearning.com/">
          https://sfcclearning.com/
        </a>
      </div>`);

    if (title) {
      $body.append(`<div class="bv-page-title" data-bv-title="${title.split('|')[0].trim()}">
        </div>`);
    }

    return { html: $body.html()!, title: title ? title.split('|')[0].trim() : '' };
  }
}
