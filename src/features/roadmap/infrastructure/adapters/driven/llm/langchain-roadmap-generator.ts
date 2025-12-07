import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { IAIRoadmapGenerator } from '@/features/roadmap/domain/ports/outbound/ia-iroadmap-generator';
import { RoadmapStep } from '@/features/roadmap/domain/value-objects/roadmap-step';
import { LearningResource } from '@/features/roadmap/domain/value-objects/learning-resource';

/**
 * LangChain-based AI Roadmap Generator
 * Uses OpenAI to analyze articles and generate learning roadmaps
 */
export class LangChainRoadmapGenerator implements IAIRoadmapGenerator {
  private model: ChatOpenAI;

  constructor(apiKey?: string, modelName: string = 'gpt-4-turbo-preview') {
    this.model = new ChatOpenAI({
      openAIApiKey: apiKey || process.env.OPENAI_API_KEY,
      modelName,
      temperature: 0.7,
    });
  }

  async generateRoadmap(input: {
    articles: Array<{
      id: string;
      title: string;
      abstract?: string;
      content?: string;
    }>;
    targetAudience?: 'beginner' | 'intermediate' | 'advanced';
    focusAreas?: string[];
    estimatedWeeks?: number;
  }): Promise<{
    title: string;
    description: string;
    steps: RoadmapStep[];
  }> {
    const articlesContext = input.articles
      .map(
        (article, idx) =>
          `Article ${idx + 1}:\nTitle: ${article.title}\nAbstract: ${article.abstract || 'N/A'}`
      )
      .join('\n\n');

    const prompt = PromptTemplate.fromTemplate(`
You are an expert learning path designer. Analyze the following research articles and create a comprehensive learning roadmap.

{articles}

Target Audience: {audience}
Focus Areas: {focusAreas}
Desired Duration: {weeks} weeks

Create a structured learning roadmap with the following JSON format:
{{
  "title": "Roadmap title",
  "description": "Overall description of what the learner will achieve",
  "steps": [
    {{
      "order": 0,
      "title": "Step title",
      "description": "What the learner will learn and why it's important",
      "estimatedWeeks": 2,
      "resources": [
        {{
          "title": "Resource title",
          "type": "video|article|book|exercise|course|paper",
          "url": "optional URL",
          "description": "Brief description",
          "estimatedDuration": 60,
          "difficulty": "beginner|intermediate|advanced"
        }}
      ],
      "prerequisites": []
    }}
  ]
}}

Guidelines:
1. Start with foundational concepts before advanced topics
2. Each step should build upon previous ones
3. Include diverse resource types (videos, articles, exercises)
4. Be specific about learning objectives
5. Estimate realistic time commitments
6. Include at least 3-5 resources per step

Return ONLY the JSON, no additional text.
`);

    const chain = prompt.pipe(this.model);

    const response = await chain.invoke({
      articles: articlesContext,
      audience: input.targetAudience || 'intermediate',
      focusAreas: input.focusAreas?.join(', ') || 'general understanding',
      weeks: input.estimatedWeeks || 12,
    });

    // Parse AI response
    const content = response.content.toString();
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const roadmapData = JSON.parse(jsonMatch[0]);

    // Convert to domain objects
    const steps = roadmapData.steps.map((stepData: any) =>
      RoadmapStep.create({
        order: stepData.order,
        title: stepData.title,
        description: stepData.description,
        estimatedWeeks: stepData.estimatedWeeks,
        resources: stepData.resources.map((resData: any) =>
          LearningResource.create({
            title: resData.title,
            type: resData.type,
            url: resData.url,
            description: resData.description,
            estimatedDuration: resData.estimatedDuration,
            difficulty: resData.difficulty,
          })
        ),
        prerequisites: stepData.prerequisites,
      })
    );

    return {
      title: roadmapData.title,
      description: roadmapData.description,
      steps,
    };
  }

  async suggestResources(input: {
    stepTitle: string;
    stepDescription: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<
    Array<{
      title: string;
      type: 'video' | 'article' | 'book' | 'exercise' | 'course';
      url?: string;
      description?: string;
    }>
  > {
    const prompt = PromptTemplate.fromTemplate(`
You are a learning resource curator. Suggest high-quality learning resources for the following topic:

Step: {stepTitle}
Description: {stepDescription}
Difficulty Level: {difficulty}

Provide 5-7 diverse, high-quality resources in JSON format:
{{
  "resources": [
    {{
      "title": "Resource title",
      "type": "video|article|book|exercise|course",
      "url": "actual URL if available",
      "description": "Why this resource is valuable"
    }}
  ]
}}

Focus on:
1. Well-known, reputable sources
2. Mix of formats (videos, articles, interactive exercises)
3. Free resources when possible
4. Recent and up-to-date content

Return ONLY the JSON, no additional text.
`);

    const chain = prompt.pipe(this.model);

    const response = await chain.invoke({
      stepTitle: input.stepTitle,
      stepDescription: input.stepDescription,
      difficulty: input.difficulty || 'intermediate',
    });

    const content = response.content.toString();
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const data = JSON.parse(jsonMatch[0]);
    return data.resources;
  }

  async suggestNextSteps(input: {
    completedSteps: number[];
    availableSteps: RoadmapStep[];
    userLevel?: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<{
    recommendedStepOrder: number;
    reason: string;
  }> {
    const completedStepsInfo = input.completedSteps
      .map((order) => {
        const step = input.availableSteps.find((s) => s.order === order);
        return step ? `${step.order}: ${step.title}` : '';
      })
      .filter(Boolean)
      .join(', ');

    const availableStepsInfo = input.availableSteps
      .filter((s) => !input.completedSteps.includes(s.order))
      .map((s) => `${s.order}: ${s.title} - ${s.description}`)
      .join('\n');

    const prompt = PromptTemplate.fromTemplate(`
You are a personalized learning advisor. Based on the user's progress, recommend the next best step.

Completed Steps: {completedSteps}
User Level: {userLevel}

Available Next Steps:
{availableSteps}

Provide your recommendation in JSON format:
{{
  "recommendedStepOrder": 3,
  "reason": "Detailed explanation of why this is the best next step"
}}

Consider:
1. Prerequisites and dependencies
2. Logical learning progression
3. User's current skill level
4. Building on completed work

Return ONLY the JSON, no additional text.
`);

    const chain = prompt.pipe(this.model);

    const response = await chain.invoke({
      completedSteps: completedStepsInfo || 'None yet',
      userLevel: input.userLevel || 'intermediate',
      availableSteps: availableStepsInfo,
    });

    const content = response.content.toString();
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    return JSON.parse(jsonMatch[0]);
  }
}
