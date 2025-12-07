import { IArticleEnrichmentLLM } from '@/features/article/domain/ports/outbound/iarticle-enrichment-llm';
import { ChatOpenAI } from '@langchain/openai';
import { LLM_PROMPTS } from './llm-prompts';

export class LangChainArticleEnrichment implements IArticleEnrichmentLLM {
  private model = new ChatOpenAI({
    temperature: 0.2,
    modelName: 'gpt-4o-mini',
  });

  async summarize(text: string): Promise<string> {
    const prompt = LLM_PROMPTS.SUMMARIZE.replace('{text}', text);
    const res = await this.model.invoke([{ role: 'user', content: prompt }]);
    return res.content.toString().trim();
  }

  async extractKeywords(text: string): Promise<string[]> {
    const prompt = LLM_PROMPTS.EXTRACT_KEYWORDS.replace('{text}', text);
    const res = await this.model.invoke([{ role: 'user', content: prompt }]);
    return res.content
      .toString()
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
      .slice(0, 5);
  }

  async classify(text: string): Promise<string[]> {
    const prompt = LLM_PROMPTS.CLASSIFY.replace('{text}', text);
    const res = await this.model.invoke([{ role: 'user', content: prompt }]);
    return res.content
      .toString()
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }
}
