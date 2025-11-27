export interface CreateArticleDTO {
  title: string;
  content: string;
  workspaceId: string;
  tags?: string[];
}
