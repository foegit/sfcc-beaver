import axios from 'axios';
import { Uri, workspace } from 'vscode';
import { IDocsSearchAdaptor, SearchResult } from './IDocsSearchAdaptor';
import { IDocsRenderer } from './viewers/IDocsRenderer';
import { SfccOfficialDocsRenderer } from './viewers/SfccOfficialDocsRenderer';
import normalizeUrl from 'normalize-url';

const BASE_URL = 'https://salesforcecommercecloud.github.io';
const CACHE_FILE = 'docs-dump.json';

export class SfccOfficialDeveloperAdaptor implements IDocsSearchAdaptor {
  static storageUri: Uri | undefined;

  renderer: IDocsRenderer;

  constructor() {
    this.renderer = new SfccOfficialDocsRenderer();
  }

  getClassLink(classPath: string): string {
    return `${BASE_URL}/b2c-dev-doc/docs/current/scriptapi/html/api/class_${classPath.replace(/\//g, '_')}.html`;
  }

  clickedHrefToAbsUrl(clickedHref: string, currentUrl: string): string {
    const currentURL = currentUrl.replace(/\/[\w]*\.html/, '');

    return normalizeUrl(`${currentURL}/${clickedHref}`);
  }

  static readonly TTL_MS = 24 * 60 * 60 * 1000;

  private static get cacheUri(): Uri | undefined {
    return SfccOfficialDeveloperAdaptor.storageUri
      ? Uri.joinPath(SfccOfficialDeveloperAdaptor.storageUri, CACHE_FILE)
      : undefined;
  }

  static async getCacheMtime(): Promise<number | null> {
    const uri = SfccOfficialDeveloperAdaptor.cacheUri;
    if (!uri) {
      return null;
    }
    try {
      const stat = await workspace.fs.stat(uri);
      return stat.mtime;
    } catch {
      return null;
    }
  }

  async forceReindex(): Promise<void> {
    const uri = SfccOfficialDeveloperAdaptor.cacheUri;
    if (uri) {
      await this.fetchAndCache(uri);
    }
  }

  private async fetchAndCache(uri: Uri): Promise<any> {
    const response = await axios.get(`${BASE_URL}/b2c-dev-doc/search.json`);

    if (response.data) {
      await workspace.fs.createDirectory(SfccOfficialDeveloperAdaptor.storageUri!);
      await workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(response.data)));
    }

    return response.data;
  }

  static async isStale(): Promise<boolean> {
    const mtime = await SfccOfficialDeveloperAdaptor.getCacheMtime();
    return mtime !== null && Date.now() - mtime > SfccOfficialDeveloperAdaptor.TTL_MS;
  }

  async parseDoc() {
    const uri = SfccOfficialDeveloperAdaptor.cacheUri;
    if (!uri) { return; }
    try {
      const raw = await workspace.fs.readFile(uri);
      return JSON.parse(raw.toString());
    } catch {
      return this.fetchAndCache(uri);
    }
  }

  async search(query: string): Promise<SearchResult> {
    const docs: { content: string; title: string; url: string }[] = await this.parseDoc();

    const q = query.toLocaleLowerCase().trim().replace(/\//g, '.');

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
      .map((i) => {
        const url = `${BASE_URL}/${i.url}`;
        const group = i.url.includes('/api/class_')
          ? ('api' as const)
          : i.url.includes('/api/package_')
            ? ('package' as const)
            : undefined;
        return { title: i.title, url, group };
      })
      .sort((a, b) => {
        const rank = (g: typeof a.group) => (g === 'api' ? 0 : g === 'package' ? 1 : 2);
        return rank(a.group) - rank(b.group);
      });

    return {
      msg: `Found ${matchedItems.length} items`,
      items: matchedItems,
    };
  }

  isDocsUrl(url: string): boolean {
    return url.startsWith(BASE_URL);
  }
}
