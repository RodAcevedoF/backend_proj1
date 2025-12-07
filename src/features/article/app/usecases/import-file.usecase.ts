import { randomUUID } from 'crypto';
import { IFileParser } from '../../domain/ports/outbound/ifile-parser';
import { IArticleEnrichmentLLM } from '../../domain/ports/outbound/iarticle-enrichment-llm';
import { IArticleRepository } from '../../domain/ports/outbound/iarticle.repository';
import { Article } from '../../domain/Article';
import {
  ImportFileDTO,
  ImportFileResultDTO,
} from '../dtos/import-file.dto';
import { ArticleResponseDTO } from '../dtos/article-response.dto';

export class ImportFileUseCase {
  constructor(
    private readonly fileParser: IFileParser,
    private readonly llm: IArticleEnrichmentLLM,
    private readonly repo: IArticleRepository
  ) {}

  async execute(input: ImportFileDTO): Promise<ImportFileResultDTO> {
    const { file, workspaceId, userId, options } = input;

    // Parse file
    const parseResult = await this.fileParser.parse(file.buffer, file.mimeType);

    if (parseResult.rows.length === 0) {
      return {
        imported: 0,
        failed: 0,
        errors: parseResult.errors,
        articles: [],
      };
    }

    const articles: Article[] = [];
    const errors = [...parseResult.errors];
    const enrichment = options?.enrich ?? false;

    // Process rows
    for (let i = 0; i < parseResult.rows.length; i++) {
      const row = parseResult.rows[i];
      const rowNum = i + 2; // +2 for header and 1-indexed

      // Validate required fields
      if (!row.title) {
        errors.push({ row: rowNum, message: 'Missing required field: title' });
        continue;
      }
      if (!row.content) {
        errors.push({ row: rowNum, message: 'Missing required field: content' });
        continue;
      }

      try {
        let summary: string | undefined;
        let categories: string[] | undefined;
        let tags = row.tags ?? [];

        // Optional LLM enrichment
        if (enrichment) {
          const content = String(row.content);
          [summary, categories, tags] = await Promise.all([
            this.llm.summarize(content),
            this.llm.classify(content),
            this.llm.extractKeywords(content).then((kw) => [
              ...new Set([...(row.tags ?? []), ...kw]),
            ]),
          ]);
        }

        const article = new Article({
          id: randomUUID(),
          workspaceId,
          userId,
          title: String(row.title),
          content: String(row.content),
          tags,
          status: enrichment ? 'enriched' : 'user_created',
          source: 'user',
          summary,
          categories,
          url: row.url ? String(row.url) : undefined,
          authors: row.authors,
          publishedAt: row.publishedAt ? new Date(row.publishedAt) : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        articles.push(article);
      } catch (err) {
        errors.push({
          row: rowNum,
          message: err instanceof Error ? err.message : 'Failed to process row',
        });
      }
    }

    // Bulk insert successful articles
    if (articles.length > 0) {
      await this.repo.bulkInsert(articles);
    }

    // Map to response DTOs
    const articleResponses: ArticleResponseDTO[] = articles.map((article) => {
      const primitives = article.toPrimitives();
      return {
        ...primitives,
        publishedAt: primitives.publishedAt?.toISOString(),
        createdAt: primitives.createdAt.toISOString(),
        updatedAt: primitives.updatedAt.toISOString(),
      };
    });

    return {
      imported: articles.length,
      failed: parseResult.rows.length - articles.length,
      errors,
      articles: articleResponses,
    };
  }
}
