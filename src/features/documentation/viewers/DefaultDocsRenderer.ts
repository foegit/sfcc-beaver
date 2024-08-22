import { IDocsRenderer } from './IDocsRenderer';

export class DefaultDocsRenderer implements IDocsRenderer {
  async render(rawHtmlResponse: string): Promise<string> {
    return rawHtmlResponse;
  }
}
