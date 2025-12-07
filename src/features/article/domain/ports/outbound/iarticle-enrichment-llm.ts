export interface IArticleEnrichmentLLM {
  summarize(text: string): Promise<string>;
  extractKeywords(text: string): Promise<string[]>;
  classify(text: string): Promise<string[]>;
}
