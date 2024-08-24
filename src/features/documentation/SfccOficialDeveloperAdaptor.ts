import axios from 'axios';
import * as cheerio from 'cheerio';
import { IDocsSearchAdaptor, SearchItem, SearchResult } from './IDocsSearchAdaptor';
import { workspace } from 'vscode';
import FsTool from '../../classes/tools/FsTool';
import { IDocsRenderer } from './viewers/IDocsRenderer';
import { SfccOfficialDocsRenderer } from './viewers/SfccOfficialDocsRenderer';
import normalizeUrl from 'normalize-url';

const BASE_URL = 'https://salesforcecommercecloud.github.io';

export class SfccOfficialDeveloperAdaptor implements IDocsSearchAdaptor {
  renderer: IDocsRenderer;

  constructor() {
    this.renderer = new SfccOfficialDocsRenderer();
  }

  getClassLink(classPath: string): string {
    /// https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_customer_AddressBook.html

    return `${BASE_URL}/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_${classPath.replace(
      /\//g,
      '_'
    )}.html`;
  }

  clickedHrefToAbsUrl(clickedHref: string, currentUrl: string): string {
    const currentURL = currentUrl.replace(/\/[\w]*\.html/, '');

    return normalizeUrl(`${currentURL}/${clickedHref}`);
  }

  async parseDoc() {
    const folder = workspace.workspaceFolders?.[0];

    if (!folder) {
      return;
    }

    if (!FsTool.fileExist('./.vscode/docs-dump.json')) {
      const jsonDump = await axios.get('https://salesforcecommercecloud.github.io/b2c-dev-doc/search.json');

      if (jsonDump.data) {
        await FsTool.write('./.vscode/docs-dump.json', JSON.stringify(jsonDump.data));
      }

      return jsonDump.data;
    }

    return FsTool.parseCurrentProjectJsonFile('./.vscode/docs-dump.json');
  }

  // https://sfcclearning.com/infocenter/search.php?term=test
  async search(query: string): Promise<SearchResult> {
    const docs: { content: string; title: string; url: string }[] = await this.parseDoc();

    const q = query.toLocaleLowerCase().trim();

    const uniqueMap: { [key: string]: boolean } = {};

    const matchedItems = docs
      .filter((i) => {
        if (uniqueMap[i.title]) {
          return false;
        }

        if (!i.title?.toLocaleLowerCase().includes(q) && !i.content?.toLocaleLowerCase().includes(q)) {
          return false;
        }

        uniqueMap[i.title] = true;

        return true;
      })
      .map((i) => ({
        title: i.title,
        description: i.content.slice(0, 100) + '...',
        url: `https://salesforcecommercecloud.github.io/${i.url}`,
      }));

    return {
      msg: `Found ${matchedItems.length} items`,
      items: matchedItems,
    };
  }

  isDocsUrl(url: string): boolean {
    return url.startsWith(BASE_URL);
  }
}
