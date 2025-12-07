import { RoadmapStep } from '@/features/roadmap/domain/value-objects/roadmap-step';

/**
 * AI Roadmap Generator Port (Outbound)
 * Defines contract for AI-powered roadmap generation
 */
export interface IAIRoadmapGenerator {
  /**
   * Generate roadmap steps from article content
   * Analyzes articles and creates a learning path
   */
  generateRoadmap(input: {
    articles: Array<{
      id: string;
      title: string;
      abstract?: string;
      content?: string;
    }>;
    targetAudience?: 'beginner' | 'intermediate' | 'advanced';
    focusAreas?: string[]; // Specific topics to focus on
    estimatedWeeks?: number; // Desired roadmap duration
  }): Promise<{
    title: string;
    description: string;
    steps: RoadmapStep[];
  }>;

  /**
   * Suggest additional resources for a roadmap step
   */
  suggestResources(input: {
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
  >;

  /**
   * Analyze user progress and suggest next steps
   */
  suggestNextSteps(input: {
    completedSteps: number[];
    availableSteps: RoadmapStep[];
    userLevel?: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<{
    recommendedStepOrder: number;
    reason: string;
  }>;
}
