import { IDocsRenderer } from './viewers/IDocsRenderer';

export type SearchItem = {
  title: string;
  descriptions?: string;
  url?: string;
};

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

export type SearchSuccessResult = {
  msg?: string;
  items: SearchItem[];
};

export type SearchFailedResult = {
  error: boolean;
  errorMsg: string;
};

export type SearchResult = XOR<SearchSuccessResult, SearchFailedResult>;

export interface IDocsSearchAdaptor {
  renderer: IDocsRenderer;

  isDocsUrl(url: string): boolean;
  getClassLink(classPath: string): string;
  clickedHrefToAbsUrl(clickedHref: string, currentUrl: string): string;
  search(query: string): Promise<SearchResult>;
}
