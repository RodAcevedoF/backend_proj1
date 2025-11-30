import { CreateArticleDTO } from './dtos/create-article.dto';
import { ArticleResponseDTO } from './dtos/article-response.dto';
import { GetArticleDTO } from './dtos/get-article.dto';
import { FindByWorkspaceDTO } from './dtos/find-by-workspace.dto';
import { UpdateArticleDTO } from './dtos/update-article.dto';
import { BulkInsertArticlesDTO } from './dtos/bulk-insert-articles.dto';
import { DeleteArticleDTO } from './dtos/delete-article.dto';

export interface IArticleService {
  create(input: CreateArticleDTO): Promise<ArticleResponseDTO>;
  getById(id: GetArticleDTO): Promise<ArticleResponseDTO>;
  findByWorkspace(id: FindByWorkspaceDTO): Promise<ArticleResponseDTO[]>;
  update(input: UpdateArticleDTO): Promise<ArticleResponseDTO>;
  delete(input: DeleteArticleDTO): Promise<void>;
  bulkWrite(input: BulkInsertArticlesDTO): Promise<ArticleResponseDTO[]>;
}
