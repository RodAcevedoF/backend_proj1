import { IArticleRepository } from '../../domain/ports/outbound/IArticle.port';

export class GetArticleByIdUseCase {
  constructor(private repo: IArticleRepository) {}

  async execute(id: string) {
    const article = await this.repo.findById(id);
    if (!article) throw new Error('Not found');
    return article.toPrimitives();
  }
}
