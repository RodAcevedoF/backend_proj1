import { IResourceService } from '@/features/resource/domain/ports/inbound/iresource.service';
import { MongoRoadmapRepository } from '@/features/roadmap/infrastructure/adapters/driven/persistence/mongo-roadmap.repository';
import { LangChainRoadmapGenerator } from '@/features/roadmap/infrastructure/adapters/driven/llm/langchain-roadmap-generator';
import { CreateRoadmapUseCase } from '@/features/roadmap/app/usecases/create-roadmap.usecase';
import { GenerateAIRoadmapUseCase } from '@/features/roadmap/app/usecases/generate-ai-roadmap.usecase';
import { GetRoadmapUseCase } from '@/features/roadmap/app/usecases/get-roadmap.usecase';
import { UpdateProgressUseCase } from '@/features/roadmap/app/usecases/update-progress.usecase';
import { AddResourceUseCase } from '@/features/roadmap/app/usecases/add-resource.usecase';
import { ListWorkspaceRoadmapsUseCase } from '@/features/roadmap/app/usecases/list-workspace-roadmaps.usecase';
import { PublishRoadmapUseCase } from '@/features/roadmap/app/usecases/publish-roadmap.usecase';
import { RoadmapServiceAdapter } from '@/features/roadmap/infrastructure/adapters/driver/roadmap.service';
import { RoadmapController } from '@/features/roadmap/infrastructure/adapters/driver/http/roadmap.controller';
import { IRoadmapService } from '@/features/roadmap/domain/ports/inbound/Iroadmap.service';

export type RoadmapDependencies = {
  roadmapRepository: MongoRoadmapRepository;
  roadmapService: IRoadmapService;
  roadmapController: RoadmapController;
};

export type RoadmapExternalDeps = {
  resourceService: IResourceService;
};

export function makeRoadmapDependencies(
  external: RoadmapExternalDeps
): RoadmapDependencies {
  const roadmapRepository = new MongoRoadmapRepository();
  const aiGenerator = new LangChainRoadmapGenerator();

  const createRoadmapUseCase = new CreateRoadmapUseCase(roadmapRepository);
  const generateAIRoadmapUseCase = new GenerateAIRoadmapUseCase(
    roadmapRepository,
    aiGenerator,
    external.resourceService
  );
  const getRoadmapUseCase = new GetRoadmapUseCase(roadmapRepository);
  const updateProgressUseCase = new UpdateProgressUseCase(roadmapRepository);
  const addResourceUseCase = new AddResourceUseCase(roadmapRepository);
  const listWorkspaceRoadmapsUseCase = new ListWorkspaceRoadmapsUseCase(
    roadmapRepository
  );
  const publishRoadmapUseCase = new PublishRoadmapUseCase(roadmapRepository);

  const roadmapService = new RoadmapServiceAdapter(
    createRoadmapUseCase,
    generateAIRoadmapUseCase,
    getRoadmapUseCase,
    listWorkspaceRoadmapsUseCase,
    updateProgressUseCase,
    addResourceUseCase,
    publishRoadmapUseCase
  );

  const roadmapController = new RoadmapController(roadmapService);

  return {
    roadmapRepository,
    roadmapService,
    roadmapController,
  };
}
