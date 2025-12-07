import { CreateArticleDTO } from '../../../app/dtos/create-article.dto';
import { ArticleResponseDTO } from '../../../app/dtos/article-response.dto';
import { GetArticleDTO } from '../../../app/dtos/get-article.dto';
import {
  FindByWorkspaceDTO,
  FindArticlesDTO,
  PaginatedArticlesResponseDTO,
} from '../../../app/dtos/find-by-workspace.dto';
import { UpdateArticleDTO } from '../../../app/dtos/update-article.dto';
import { BulkInsertArticlesDTO } from '../../../app/dtos/bulk-insert-articles.dto';
import { DeleteArticleDTO } from '../../../app/dtos/delete-article.dto';
import { ImportExternalArticleDTO } from '../../../app/dtos/import-external-article.dto';
import { ImportFileDTO, ImportFileResultDTO } from '../../../app/dtos/import-file.dto';
import { SearchExternalArticlesDTO } from '../../../app/dtos/search-external-articles.dto';
import { SearchResult } from '../outbound/iscientific-article-provider';

export interface IArticleService {
  create(input: CreateArticleDTO): Promise<ArticleResponseDTO>;
  getById(id: GetArticleDTO): Promise<ArticleResponseDTO>;
  findByWorkspace(id: FindByWorkspaceDTO): Promise<ArticleResponseDTO[]>;
  findArticles(
    input: FindArticlesDTO
  ): Promise<PaginatedArticlesResponseDTO<ArticleResponseDTO>>;
  update(input: UpdateArticleDTO): Promise<ArticleResponseDTO>;
  delete(input: DeleteArticleDTO): Promise<void>;
  bulkWrite(input: BulkInsertArticlesDTO): Promise<ArticleResponseDTO[]>;
  searchExternalArticles(
    input: SearchExternalArticlesDTO
  ): Promise<SearchResult>;
  importExternalArticle(
    input: ImportExternalArticleDTO
  ): Promise<ArticleResponseDTO>;
  importFromFile(input: ImportFileDTO): Promise<ImportFileResultDTO>;
}
