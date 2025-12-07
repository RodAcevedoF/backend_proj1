import { ArticleResponseDTO } from './article-response.dto';

export interface ImportFileDTO {
  workspaceId: string;
  userId: string;
  file: {
    buffer: Buffer;
    mimeType: string;
    originalName: string;
  };
  options?: ImportFileOptions;
}

export interface ImportFileOptions {
  enrich?: boolean;
  columnMapping?: {
    title?: string;
    content?: string;
    tags?: string;
    url?: string;
    authors?: string;
    publishedAt?: string;
  };
}

export interface ImportFileResultDTO {
  imported: number;
  failed: number;
  errors: { row: number; message: string }[];
  articles: ArticleResponseDTO[];
}
