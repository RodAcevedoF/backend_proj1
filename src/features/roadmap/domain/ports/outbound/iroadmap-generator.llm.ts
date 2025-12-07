import { RoadmapProps } from '@/features/roadmap/domain/Roadmap';

export interface IRoadmapGeneratorLLM {
  /**
   * Generates a learning roadmap based on articles and a topic
   * @param topic - The learning topic/goal
   * @param articles - Array of article summaries to base the roadmap on
   * @returns Generated roadmap structure
   */
  generateRoadmap(
    topic: string,
    articles: Array<{
      id: string;
      title: string;
      summary: string;
      categories: string[];
    }>
  ): Promise<
    Omit<
      RoadmapProps,
      'id' | 'workspaceId' | 'userId' | 'createdAt' | 'updatedAt'
    >
  >;
}
