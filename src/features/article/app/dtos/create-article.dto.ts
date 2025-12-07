export type ArticleStatus = 'external_raw' | 'enriched' | 'user_created';
export type ArticleSource = 'semantic-scholar' | 'user' | 'arxiv' | 'pubmed';

export interface CreateArticleDTO {
  title: string;
  content: string;
  workspaceId?: string;
  userId?: string;
  tags?: string[];

  // Metadata
  status?: ArticleStatus; // defaults to 'user_created'
  source?: ArticleSource; // defaults to 'user'
  externalId?: string;

  // Optional enriched/external fields
  authors?: string[];
  summary?: string;
  categories?: string[];
  url?: string;
  publishedAt?: string; // ISO
}
