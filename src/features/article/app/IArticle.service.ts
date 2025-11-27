import { CreateArticleDTO } from './dtos/create-article.dto';
import { ArticleResponseDTO } from './dtos/article-response.dto';

export interface IArticleService {
  create(input: CreateArticleDTO): Promise<ArticleResponseDTO>;
  getById(id: string): Promise<ArticleResponseDTO>;
}
