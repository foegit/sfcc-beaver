export interface IDocsRenderer {
  render(rawHtmlResponse: string): Promise<{
    html: string;
    title: string;
  }>;
}
