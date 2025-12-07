import { EntityId } from '@/core/domain';
import { Roadmap } from '@/features/roadmap/domain/Roadmap';
import { LearningResource } from '@/features/roadmap/domain/value-objects/learning-resource';
import { Progress } from '@/features/roadmap/domain/value-objects/progress';
import { RoadmapStep } from '@/features/roadmap/domain/value-objects/roadmap-step';

/**
 * Roadmap Mapper
 * Converts between domain and persistence models
 */
export class RoadmapMapper {
  /**
   * Convert from MongoDB document to domain entity
   */
  static toDomain(raw: any): Roadmap {
    const steps = (raw.steps || []).map((stepData: any) =>
      RoadmapStep.create({
        order: stepData.order,
        title: stepData.title,
        description: stepData.description,
        estimatedWeeks: stepData.estimatedWeeks,
        resources: (stepData.resources || []).map((resData: any) =>
          LearningResource.create({
            title: resData.title,
            type: resData.type,
            url: resData.url,
            description: resData.description,
            estimatedDuration: resData.estimatedDuration,
            difficulty: resData.difficulty,
          })
        ),
        prerequisites: stepData.prerequisites,
      })
    );

    const progress = (raw.progress || []).map((progData: any) =>
      Progress.create({
        userId: progData.userId,
        stepOrder: progData.stepOrder,
        completedAt: progData.completedAt
          ? new Date(progData.completedAt)
          : undefined,
        completedResources: progData.completedResources || [],
        notes: progData.notes,
      })
    );

    return Roadmap.reconstitute({
      id: EntityId.from(raw._id),
      workspaceId: raw.workspaceId,
      title: raw.title,
      description: raw.description,
      steps,
      progress,
      sourceArticleIds: raw.sourceArticleIds || [],
      generatedBy: raw.generatedBy,
      createdBy: raw.createdBy,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
      isPublished: raw.isPublished,
    });
  }

  /**
   * Convert from domain entity to MongoDB document
   */
  static toPersistence(roadmap: Roadmap): any {
    const primitives = roadmap.toPrimitives();

    return {
      _id: primitives.id,
      workspaceId: primitives.workspaceId,
      title: primitives.title,
      description: primitives.description,
      steps: primitives.steps,
      progress: primitives.progress.map((p) => ({
        userId: p.userId,
        stepOrder: p.stepOrder,
        completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
        completedResources: p.completedResources,
        notes: p.notes,
      })),
      sourceArticleIds: primitives.sourceArticleIds,
      generatedBy: primitives.generatedBy,
      createdBy: primitives.createdBy,
      isPublished: primitives.isPublished,
      createdAt: new Date(primitives.createdAt),
      updatedAt: new Date(primitives.updatedAt),
    };
  }
}
