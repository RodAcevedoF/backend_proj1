import { WorkspaceModel } from './workspace.schema';
import { WorkspaceMapper } from './workspace.mapper';
import { IWorkspaceRepository } from '@/features/workspaces/domain/ports/outbound/iworkspace.repository';
import { EntityId } from '@/core/domain';
import { Workspace } from '@/features/workspaces/domain/workspace';

/**
 * MongoDB implementation of Workspace Repository
 * Adapter for the outbound port (hexagonal architecture)
 */
export class MongoWorkspaceRepository implements IWorkspaceRepository {
  async findById(id: EntityId): Promise<Workspace | null> {
    const doc = await WorkspaceModel.findById(id.toString()).lean();
    if (!doc) return null;
    return WorkspaceMapper.toDomain(doc as any);
  }

  async findByUserId(userId: EntityId): Promise<Workspace[]> {
    const docs = await WorkspaceModel.find({
      'members.userId': userId.toString(),
    }).lean();

    return docs.map((doc) => WorkspaceMapper.toDomain(doc as any));
  }

  async findByNameAndUserId(
    name: string,
    userId: EntityId
  ): Promise<Workspace[]> {
    const docs = await WorkspaceModel.find({
      name: { $regex: name, $options: 'i' },
      'members.userId': userId.toString(),
    }).lean();

    return docs.map((doc) => WorkspaceMapper.toDomain(doc as any));
  }

  async save(workspace: Workspace): Promise<void> {
    const doc = WorkspaceMapper.toPersistence(workspace);

    await WorkspaceModel.findByIdAndUpdate(doc._id, doc, {
      upsert: true,
      new: true,
    });

    // TODO: Publish domain events
    // const events = workspace.domainEvents;
    // await this.eventDispatcher.dispatch(events);
    // workspace.clearEvents();
  }

  async delete(id: EntityId): Promise<void> {
    await WorkspaceModel.findByIdAndDelete(id.toString());
  }

  async isMember(workspaceId: EntityId, userId: EntityId): Promise<boolean> {
    const count = await WorkspaceModel.countDocuments({
      _id: workspaceId.toString(),
      'members.userId': userId.toString(),
    });
    return count > 0;
  }
}
