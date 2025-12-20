import type { SortOrder } from 'mongoose';
import { Resource, ResourceSource, ResourceType } from '@/features/resource/domain/Resource';
import {
  IResourceRepository,
  PaginatedResult,
  PaginationOptions,
  ResourceQueryFilters,
  SortOptions,
} from '@/features/resource/domain/ports/outbound/iresource.repository';
import { ResourceMapper } from './resource.mapper';
import { ResourceModel, ResourceDocument } from './resource.schema';

export class MongoResourceRepository implements IResourceRepository {
  async findById(id: string): Promise<Resource | null> {
    const doc = await ResourceModel.findById(id).lean();
    if (!doc) return null;
    return ResourceMapper.toDomain(doc as never);
  }

  async findByIds(ids: string[]): Promise<Resource[]> {
    const docs = await ResourceModel.find({ _id: { $in: ids } }).lean();
    return docs.map((doc) => ResourceMapper.toDomain(doc as never));
  }

  async findByWorkspace(workspaceId: string): Promise<Resource[]> {
    const docs = await ResourceModel.find({ workspaceId }).lean();
    return docs.map((doc) => ResourceMapper.toDomain(doc as never));
  }

  async findByType(workspaceId: string, type: ResourceType): Promise<Resource[]> {
    const docs = await ResourceModel.find({ workspaceId, type }).lean();
    return docs.map((doc) => ResourceMapper.toDomain(doc as never));
  }

  async findWithFilters(
    filters: ResourceQueryFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<PaginatedResult<Resource>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (filters.workspaceId) query.workspaceId = filters.workspaceId;
    if (filters.userId) query.userId = filters.userId;
    if (filters.type) query.type = filters.type;
    if (filters.types?.length) query.type = { $in: filters.types };
    if (filters.status) query.status = filters.status;
    if (filters.source) query.source = filters.source;
    if (filters.categoryIds?.length) query.categoryIds = { $in: filters.categoryIds };
    if (filters.tags?.length) query.tags = { $in: filters.tags };
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const sortField = sort?.field ?? 'createdAt';
    const sortOrder: SortOrder = sort?.order === 'asc' ? 1 : -1;
    const sortQuery: Record<string, SortOrder> = { [sortField]: sortOrder };

    const [docs, total] = await Promise.all([
      ResourceModel.find(query).sort(sortQuery).skip(skip).limit(limit).lean(),
      ResourceModel.countDocuments(query),
    ]);

    return {
      data: docs.map((doc) => ResourceMapper.toDomain(doc as never)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByExternalId(source: ResourceSource, externalId: string): Promise<Resource | null> {
    const doc = await ResourceModel.findOne({ source, externalId }).lean();
    if (!doc) return null;
    return ResourceMapper.toDomain(doc as never);
  }

  async save(resource: Resource): Promise<void> {
    const data = ResourceMapper.toPersistence(resource);
    await ResourceModel.create(data as any);
  }

  async bulkInsert(resources: Resource[]): Promise<void> {
    const docs = resources.map((r) => ResourceMapper.toPersistence(r));
    await ResourceModel.insertMany(docs as any);
  }

  async update(resource: Resource): Promise<void> {
    const data = ResourceMapper.toPersistence(resource);
    const { _id, ...updateData } = data as { _id: string; [key: string]: unknown };
    await ResourceModel.updateOne({ _id }, { $set: updateData });
  }

  async deleteById(id: string): Promise<void> {
    await ResourceModel.deleteOne({ _id: id });
  }

  async deleteByWorkspace(workspaceId: string): Promise<number> {
    const result = await ResourceModel.deleteMany({ workspaceId });
    return result.deletedCount;
  }

  async countByWorkspace(workspaceId: string): Promise<number> {
    return ResourceModel.countDocuments({ workspaceId });
  }

  async countByType(workspaceId: string, type: ResourceType): Promise<number> {
    return ResourceModel.countDocuments({ workspaceId, type });
  }
}
