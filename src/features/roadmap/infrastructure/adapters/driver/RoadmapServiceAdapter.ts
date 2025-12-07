import { Result } from '@/core/domain';
import { IRoadmapService } from '@/features/roadmap/domain/ports/inbound/IRoadmapService';
import { CreateRoadmapUseCase } from '@/features/roadmap/app/usecases/create-roadmap.usecase';
import { GenerateAIRoadmapUseCase } from '@/features/roadmap/app/usecases/generate-ai-roadmap.usecase';
import { GetRoadmapUseCase } from '@/features/roadmap/app/usecases/get-roadmap.usecase';
import { ListWorkspaceRoadmapsUseCase } from '@/features/roadmap/app/usecases/list-workspace-roadmaps.usecase';
import { UpdateProgressUseCase } from '@/features/roadmap/app/usecases/update-progress.usecase';
import { AddResourceUseCase } from '@/features/roadmap/app/usecases/add-resource.usecase';
import { PublishRoadmapUseCase } from '@/features/roadmap/app/usecases/publish-roadmap.usecase';
import {
  CreateRoadmapDto,
  GenerateAIRoadmapDto,
  AddResourceDto,
  UpdateProgressDto,
  RoadmapResponseDto,
  RoadmapWithProgressDto,
} from '@/features/roadmap/app/dtos/roadmap.dto';

/**
 * Roadmap Service Adapter
 * Implements IRoadmapService - orchestrates use cases
 */
export class RoadmapServiceAdapter implements IRoadmapService {
  constructor(
    private readonly createRoadmapUseCase: CreateRoadmapUseCase,
    private readonly generateAIRoadmapUseCase: GenerateAIRoadmapUseCase,
    private readonly getRoadmapUseCase: GetRoadmapUseCase,
    private readonly listWorkspaceRoadmapsUseCase: ListWorkspaceRoadmapsUseCase,
    private readonly updateProgressUseCase: UpdateProgressUseCase,
    private readonly addResourceUseCase: AddResourceUseCase,
    private readonly publishRoadmapUseCase: PublishRoadmapUseCase
  ) {}

  async create(
    dto: CreateRoadmapDto,
    userId: string
  ): Promise<Result<RoadmapResponseDto>> {
    return this.createRoadmapUseCase.execute(dto, userId);
  }

  async generateAI(
    dto: GenerateAIRoadmapDto,
    userId: string
  ): Promise<Result<RoadmapResponseDto>> {
    return this.generateAIRoadmapUseCase.execute(dto, userId);
  }

  async getById(
    roadmapId: string,
    userId: string
  ): Promise<Result<RoadmapWithProgressDto>> {
    return this.getRoadmapUseCase.execute(roadmapId, userId);
  }

  async listByWorkspace(
    workspaceId: string,
    onlyPublished?: boolean
  ): Promise<Result<RoadmapResponseDto[]>> {
    return this.listWorkspaceRoadmapsUseCase.execute(workspaceId, onlyPublished);
  }

  async updateProgress(
    roadmapId: string,
    dto: UpdateProgressDto,
    userId: string
  ): Promise<Result<void>> {
    return this.updateProgressUseCase.execute(roadmapId, dto, userId);
  }

  async addResource(
    roadmapId: string,
    dto: AddResourceDto
  ): Promise<Result<void>> {
    return this.addResourceUseCase.execute(roadmapId, dto);
  }

  async publish(roadmapId: string): Promise<Result<void>> {
    return this.publishRoadmapUseCase.execute(roadmapId);
  }
}
