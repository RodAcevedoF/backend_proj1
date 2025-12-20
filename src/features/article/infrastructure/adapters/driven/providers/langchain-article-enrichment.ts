import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import {
  IArticleEnrichmentLLM,
  ArticleEnrichmentInput,
  ArticleEnrichmentResult,
} from '@/features/article/domain/ports/outbound/iarticle-enrichment-llm';

const EnrichmentSchema = z.object({
  summary: z
    .string()
    .describe(
      'A 2-3 sentence summary highlighting the main research question, methodology, and key findings'
    ),
  keywords: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe(
      'Technical keywords or concepts from the article, using standard academic terminology'
    ),
  categories: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe(
      'Academic research categories or domains (e.g., Machine Learning, Computational Physics)'
    ),
});

const SYSTEM_PROMPT = `You are an expert academic research assistant specializing in scientific article analysis.
Your task is to analyze scientific articles and extract structured information.

Guidelines:
- Base your analysis ONLY on the provided information (title, abstract, authors, venue)
- If the abstract is empty or missing, use the title and other metadata to make reasonable inferences
- Use standard academic terminology for categories
- Keywords should be specific technical terms, not generic words like "research" or "study"
- Summary should be informative and highlight the main contribution`;

export class LangChainArticleEnrichment implements IArticleEnrichmentLLM {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      temperature: 0.1,
      modelName: 'gpt-4o-mini',
    });
  }

  async enrich(input: ArticleEnrichmentInput): Promise<ArticleEnrichmentResult> {
    const structuredModel = this.model.withStructuredOutput(EnrichmentSchema);

    const userPrompt = this.buildPrompt(input);

    const result = await structuredModel.invoke([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ]);

    return {
      summary: result.summary,
      keywords: result.keywords,
      categories: result.categories,
    };
  }

  private buildPrompt(input: ArticleEnrichmentInput): string {
    const parts: string[] = [`Title: ${input.title}`];

    if (input.abstract && input.abstract.trim().length > 0) {
      parts.push(`Abstract: ${input.abstract}`);
    } else {
      parts.push('Abstract: Not available');
    }

    if (input.authors && input.authors.length > 0) {
      parts.push(`Authors: ${input.authors.join(', ')}`);
    }

    if (input.venue) {
      parts.push(`Venue: ${input.venue}`);
    }

    return parts.join('\n\n');
  }
}
