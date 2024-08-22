export interface IDocsRenderer {
  render(rawHtmlResponse: string): Promise<string>;
}
