// !TODO

import { IDocsRenderer } from './IDocsRenderer';
import * as cheerio from 'cheerio';

export class SfccOfficialDocsRenderer implements IDocsRenderer {
  async render(htmlResponse: string): Promise<string> {
    const $ = cheerio.load(htmlResponse);
    const $body = $('body');

    $body.find('script').remove();
    $body.find('footer').remove();
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

    $body.find('.header:contains("Method Summary")').closest('.section').remove();

    return $body.html()!;
  }
}
