import axios from 'axios';
import * as cheerio from 'cheerio';
import { IDocsSearchAdaptor, SearchItem, SearchResult } from './IDocsSearchAdaptor';
import { IDocsRenderer } from './viewers/IDocsRenderer';
import { SfccLearningDocsRenderer } from './viewers/SfccLearningDocsRenderer';
import normalizeUrl from 'normalize-url';

const BASE_URL = 'https://sfcclearning.com/';

export class SfccLearningSearchAdaptor implements IDocsSearchAdaptor {
  renderer: IDocsRenderer;

  constructor() {
    this.renderer = new SfccLearningDocsRenderer();
  }

  getClassLink(classPath: string): string {
    return `${BASE_URL}/infocenter/DWAPI/scriptapi/html/api/class_${classPath.split('/').join('_')}.php`;
  }

  clickedHrefToAbsUrl(clickedHref: string, currentUrl: string): string {
    if (clickedHref.startsWith('http')) {
      return clickedHref;
    }

    const currentURL = currentUrl.replace(/\/[\w]*\.html/, '');

    return normalizeUrl(`${currentURL}/${clickedHref}`);
  }

  toSearchItems(rawHtml: string): SearchItem[] {
    const $ = cheerio.load(rawHtml);

    const $items = $('ul>li');

    const searchItems: SearchItem[] = $($items)
      .map((index, $li) => {
        const $a = $($li).find('a');

        return {
          title: $a.attr('title') || '',
          subtitle: $($li).find('small').text(),
          url: $a.attr('href') || '',

          description: $($li.lastChild || '').text(),
        };
      })
      .toArray()
      .filter((sr) => !!sr.title);

    return searchItems;
  }

  // https://sfcclearning.com/infocenter/search.php?term=test
  async search(query: string): Promise<SearchResult> {
    if (query.trim().length < 3) {
      return {
        msg: 'Enter at least 3 cars',
        items: [],
      };
    }

    try {
      const response = await axios.get(`${BASE_URL}/infocenter/search.php?term=${query}`);
      const items = this.toSearchItems(response.data);
      return {
        msg: `Found ${items.length} results`,
        items,
      };
    } catch (err) {
      return {
        error: true,
        errorMsg: 'An error occurred searching in docs',
      };
    }
  }

  isOwnUrl(url: string): boolean {
    return url.startsWith(BASE_URL);
  }
}
