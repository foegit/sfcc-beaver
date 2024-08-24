import { IDocsRenderer } from './IDocsRenderer';

export class DefaultDocsRenderer implements IDocsRenderer {
  async render(rawHtmlResponse: string): Promise<{
    html: string;
    title: string;
  }> {
    return { html: rawHtmlResponse, title: '' };
  }
}
