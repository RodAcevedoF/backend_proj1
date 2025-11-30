export interface BulkInsertArticlesDTO {
  articles: Array<{
    id: string;
    workspaceId: string;
    title: string;
    content: string;
    tags?: string[];
    createdAt: string; // ISO
    updatedAt: string; // ISO
  }>;
}
