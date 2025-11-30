import { IArticleRepository } from '@/features/article/domain/ports/outbound/iarticle.repository';
import { DeleteArticleDTO } from '../dtos/delete-article.dto';

export class DeleteArticleUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  async execute(input: DeleteArticleDTO): Promise<void> {
    const article = await this.repo.findById(input.id);
    if (!article) throw new Error('Not found');

    await this.repo.deleteById(input.id);
  }
}
