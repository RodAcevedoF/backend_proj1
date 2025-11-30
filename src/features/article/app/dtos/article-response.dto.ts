export interface ArticleResponseDTO {
  id: string;
  workspaceId?: string;
  userId?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
