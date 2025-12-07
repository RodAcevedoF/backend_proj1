export type ArticleStatus = 'external_raw' | 'enriched' | 'user_created';
export type ArticleSource = 'semantic-scholar' | 'user' | 'arxiv' | 'pubmed';

export interface ArticleResponseDTO {
  id: string;
  workspaceId?: string;
  userId?: string;
  title: string;
  content: string;
  tags: string[];

  // Metadata
  status: ArticleStatus;
  source: ArticleSource;
  externalId?: string;

  // AI-enriched fields
  summary?: string;
  categories?: string[];

  // External article metadata
  url?: string;
  authors?: string[];
  publishedAt?: string; // ISO

  createdAt: string; // ISO
  updatedAt: string; // ISO
}
