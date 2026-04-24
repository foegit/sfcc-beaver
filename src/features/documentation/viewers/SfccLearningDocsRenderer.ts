import { IDocsRenderer } from './IDocsRenderer';
import * as cheerio from 'cheerio';

export class SfccLearningDocsRenderer implements IDocsRenderer {
  async render(htmlResponse: string) {
    const $ = cheerio.load(htmlResponse);
    const $body = $('body');
    const title = $('title').text();
    // remove all scripts and navigation from entire document
    $('script').remove();
    $('aside').remove();
    // remove footer
    $body.find('footer').remove();
    // remove retirement footer
    $body.find('.retirement-footer').remove();
    $body.find('.home-container>.copy').remove();
    // remove nums visit banner
    $body.find('.numVisits').remove();
    // ocapi deprecation message, is outdated completely
    $body.find('#ocapiDeprecationBanner').remove();
    $body.find('nav').remove();
    $body.find('header').remove();
    $body.find('form').remove();
    $body.find('.quick-links').remove();
    $body.find('.home-container').remove();

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
      let $ancestor = $breadcrumbs;
      while ($ancestor.parent().length && $ancestor.parent()[0].tagName !== 'body') {
        $ancestor = $ancestor.parent();
      }
      $ancestor.prevAll().remove();
    }

    if ($breadcrumbs.length > 0) {
      const SKIP_LABELS = new Set(['home', 'search']);
      const $allBreadcrumbsLinks = $breadcrumbs.find('a').toArray()
        .filter((el) => !SKIP_LABELS.has($(el).text().trim().toLowerCase()));

      $breadcrumbs.empty();

      if ($allBreadcrumbsLinks.length === 0) {
        $breadcrumbs.remove();
      } else {
        $allBreadcrumbsLinks.forEach((el, i) => {
          $breadcrumbs.append(el);
          if (i < $allBreadcrumbsLinks.length - 1) {
            $breadcrumbs.append(' / ');
          }
        });
      }
    }

    // Remove the page title heading if it duplicates what's already shown as H1
    const $h1 = $body.find('h1').first();
    const h1Text = $h1.text().trim();
    if (h1Text) {
      $body.find('h2, h3').each((_, el) => {
        if ($(el).text().trim() === h1Text) {
          $(el).remove();
        }
      });
    }

    $body.find('.pre.codeblock').each((_, $el) => {
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
