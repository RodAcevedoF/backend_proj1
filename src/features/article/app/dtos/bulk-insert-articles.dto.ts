import { CreateArticleDTO } from './create-article.dto';

export interface BulkInsertArticlesDTO {
  articles: Array<CreateArticleDTO>;
}
