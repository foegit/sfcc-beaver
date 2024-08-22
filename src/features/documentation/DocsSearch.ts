import { IDocsSearchAdaptor, SearchResult } from './IDocsSearchAdaptor';

export default class DocsSearchProvider {
  constructor(private searchAdaptor: IDocsSearchAdaptor) {}

  search(query: string): Promise<SearchResult> {
    return this.searchAdaptor.search(query);
  }
}
