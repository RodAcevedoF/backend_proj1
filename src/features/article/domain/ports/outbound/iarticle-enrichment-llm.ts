export interface ArticleEnrichmentInput {
  title: string;
  abstract: string;
  authors?: string[];
  venue?: string;
}

export interface ArticleEnrichmentResult {
  summary: string;
  keywords: string[];
  categories: string[];
}

export interface IArticleEnrichmentLLM {
  enrich(input: ArticleEnrichmentInput): Promise<ArticleEnrichmentResult>;
}
