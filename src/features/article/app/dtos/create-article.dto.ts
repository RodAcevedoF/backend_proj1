export interface CreateArticleDTO {
  title: string;
  content: string;
  workspaceId?: string;
  userId?: string;
  tags?: string[];
}
