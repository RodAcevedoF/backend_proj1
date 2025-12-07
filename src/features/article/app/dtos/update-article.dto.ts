export interface UpdateArticleDTO {
  id: string;
  userId: string;
  title?: string;
  content?: string;
  tags?: string[];
}
