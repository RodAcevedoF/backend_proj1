import { ArticleStatus, ArticleSource } from '../../domain/Article';

export interface FindByWorkspaceDTO {
  workspaceId: string;
}

export interface FindArticlesDTO {
  workspaceId?: string;
  userId?: string;
  status?: ArticleStatus;
  source?: ArticleSource;
  search?: string;
  page?: number; // Default: 1
  limit?: number; // Default: 20
}

export interface PaginatedArticlesResponseDTO<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
