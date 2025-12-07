import { RoadmapModel } from './roadmap.schema';
import { RoadmapMapper } from './roadmap.mapper';
import { Roadmap } from '@/features/roadmap/domain/Roadmap';
import { IRoadmapRepository } from '@/features/roadmap/domain/ports/outbound/iroadmap.repository';

/**
 * MongoDB Roadmap Repository
 * Implements IRoadmapRepository using Mongoose
 */
export class MongoRoadmapRepository implements IRoadmapRepository {
  async save(roadmap: Roadmap): Promise<void> {
    const persistence = RoadmapMapper.toPersistence(roadmap);

    await RoadmapModel.findByIdAndUpdate(persistence._id, persistence, {
      upsert: true,
      new: true,
    });
  }

  async findById(id: string): Promise<Roadmap | null> {
    const doc = await RoadmapModel.findById(id);

    if (!doc) {
      return null;
    }

    return RoadmapMapper.toDomain(doc.toObject());
  }

  async findByWorkspaceId(workspaceId: string): Promise<Roadmap[]> {
    const docs = await RoadmapModel.find({ workspaceId }).sort({
      createdAt: -1,
    });

    return docs.map((doc) => RoadmapMapper.toDomain(doc.toObject()));
  }

  async findPublishedByWorkspaceId(workspaceId: string): Promise<Roadmap[]> {
    const docs = await RoadmapModel.find({
      workspaceId,
      isPublished: true,
    }).sort({ createdAt: -1 });

    return docs.map((doc) => RoadmapMapper.toDomain(doc.toObject()));
  }

  async findByCreatorId(userId: string): Promise<Roadmap[]> {
    const docs = await RoadmapModel.find({ createdBy: userId }).sort({
      createdAt: -1,
    });

    return docs.map((doc) => RoadmapMapper.toDomain(doc.toObject()));
  }

  async delete(id: string): Promise<void> {
    await RoadmapModel.findByIdAndDelete(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await RoadmapModel.countDocuments({ _id: id });
    return count > 0;
  }
}
