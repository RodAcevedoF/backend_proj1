import { Result } from '@/core/domain';
import {
  CreateRoadmapDto,
  GenerateAIRoadmapDto,
  AddResourceDto,
  UpdateProgressDto,
  RoadmapResponseDto,
  RoadmapWithProgressDto,
} from '@/features/roadmap/app/dtos/roadmap.dto';

/**
 * Roadmap Service Interface
 * Primary port for roadmap operations
 */
export interface IRoadmapService {
  create(dto: CreateRoadmapDto, userId: string): Promise<Result<RoadmapResponseDto>>;
  generateAI(dto: GenerateAIRoadmapDto, userId: string): Promise<Result<RoadmapResponseDto>>;
  getById(roadmapId: string, userId: string): Promise<Result<RoadmapWithProgressDto>>;
  listByWorkspace(workspaceId: string, onlyPublished?: boolean): Promise<Result<RoadmapResponseDto[]>>;
  updateProgress(
    roadmapId: string,
    dto: UpdateProgressDto,
    userId: string
  ): Promise<Result<void>>;
  addResource(roadmapId: string, dto: AddResourceDto): Promise<Result<void>>;
  publish(roadmapId: string): Promise<Result<void>>;
}
