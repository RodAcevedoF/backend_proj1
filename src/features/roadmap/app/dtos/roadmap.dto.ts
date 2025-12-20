/**
 * Create Roadmap DTO
 */
export interface CreateRoadmapDto {
  workspaceId: string;
  title: string;
  description: string;
  categoryIds?: string[];
  sourceResourceIds?: string[];
}

/**
 * Generate AI Roadmap DTO
 */
export interface GenerateAIRoadmapDto {
  workspaceId: string;
  resourceIds: string[];
  categoryIds?: string[];
  targetAudience?: 'beginner' | 'intermediate' | 'advanced';
  focusAreas?: string[];
  estimatedWeeks?: number;
}

/**
 * Update Roadmap DTO
 */
export interface UpdateRoadmapDto {
  title?: string;
  description?: string;
}

/**
 * Add Step DTO
 */
export interface AddStepDto {
  order: number;
  title: string;
  description: string;
  estimatedWeeks?: number;
}

/**
 * Add Resource to Step DTO
 */
export interface AddResourceDto {
  stepOrder: number;
  resourceId?: string; // Optional reference to Resource entity
  title: string;
  type: 'video' | 'article' | 'book' | 'exercise' | 'course' | 'paper';
  url?: string;
  description?: string;
  estimatedDuration?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Update Progress DTO
 */
export interface UpdateProgressDto {
  stepOrder: number;
  resourceTitle?: string; // If provided, marks resource as complete
  completeStep?: boolean; // If true, marks entire step as complete
  notes?: string;
}

/**
 * Roadmap Response DTO
 */
export interface RoadmapResponseDto {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  categoryIds: string[];
  steps: Array<{
    order: number;
    title: string;
    description: string;
    estimatedWeeks?: number;
    resources: Array<{
      resourceId?: string;
      title: string;
      type: string;
      url?: string;
      description?: string;
      estimatedDuration?: number;
      difficulty?: string;
    }>;
    prerequisites?: string[];
  }>;
  sourceResourceIds: string[];
  generatedBy: 'ai' | 'manual';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
}

/**
 * Roadmap with Progress Response DTO
 */
export interface RoadmapWithProgressDto extends RoadmapResponseDto {
  userProgress: {
    completionPercentage: number;
    completedSteps: number[];
    currentStep?: number;
  };
}
