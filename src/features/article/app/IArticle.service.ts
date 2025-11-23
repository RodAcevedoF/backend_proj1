export interface IArticleService {
  create(input: { title: string; content: string }): Promise<any>;
  getById(id: string): Promise<any>;
}
