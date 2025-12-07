import {
  IScientificArticlesProvider,
  SearchResult,
} from '../../domain/ports/outbound/iscientific-article-provider';
import { SearchExternalArticlesDTO } from '../dtos/search-external-articles.dto';

export class SearchExternalArticlesUseCase {
  constructor(private provider: IScientificArticlesProvider) {}

  async execute(input: SearchExternalArticlesDTO): Promise<SearchResult> {
    return await this.provider.search(input.query, {
      limit: input.limit,
      offset: input.offset,
    });
  }
}
