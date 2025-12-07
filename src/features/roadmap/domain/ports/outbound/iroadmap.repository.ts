import { Roadmap } from '@/features/roadmap/domain/Roadmap';

export interface IRoadmapRepository {
  save(roadmap: Roadmap): Promise<void>;
  findById(id: string): Promise<Roadmap | null>;
  findByWorkspace(workspaceId: string): Promise<Roadmap[]>;
  findByUser(userId: string): Promise<Roadmap[]>;
}
