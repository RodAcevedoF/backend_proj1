export type ArticleStatus = 'external_raw' | 'enriched' | 'user_created';
export type ArticleSource = 'semantic-scholar' | 'user' | 'arxiv' | 'pubmed';

export interface CreateArticleDTO {
  title: string;
  content: string;
  workspaceId?: string;
  userId?: string;
  tags?: string[];
  categoryIds?: string[]; // User-defined category references

  // Metadata
  status?: ArticleStatus; // defaults to 'user_created'
  source?: ArticleSource; // defaults to 'user'
  externalId?: string;

  // Optional enriched/external fields
  authors?: string[];
  summary?: string;
  aiCategories?: string[]; // AI-generated categories
  url?: string;
  publishedAt?: string; // ISO
}
