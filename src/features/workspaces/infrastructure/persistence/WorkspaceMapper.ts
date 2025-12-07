import { Workspace } from '../../domain/Workspace';
import { EntityId } from '../../../../core/domain/EntityId';
import { WorkspaceMember } from '../../domain/WorkspaceMember';
import { WorkspaceSettings } from '../../domain/WorkspaceSettings';

interface WorkspaceDocument {
  _id: string;
  name: string;
  description?: string;
  members: Array<{
    userId: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    joinedAt: Date;
    invitedBy?: string;
  }>;
  settings: {
    allowPublicAccess: boolean;
    defaultArticleVisibility: 'private' | 'workspace' | 'public';
    enableAIEnrichment: boolean;
    maxMembersPerWorkspace?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workspace Mapper
 * Converts between domain Workspace entity and persistence WorkspaceDocument
 */
export class WorkspaceMapper {
  /**
   * Convert persistence document to domain entity
   */
  static toDomain(doc: WorkspaceDocument): Workspace {
    const members = doc.members.map((m) =>
      WorkspaceMember.fromPrimitives({
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        invitedBy: m.invitedBy,
      })
    );

    const settings = WorkspaceSettings.create(doc.settings);

    return Workspace.from(EntityId.from(doc._id), {
      name: doc.name,
      description: doc.description,
      members,
      settings,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /**
   * Convert domain entity to persistence document
   */
  static toPersistence(workspace: Workspace): WorkspaceDocument {
    const primitives = workspace.toPrimitives();

    return {
      _id: primitives.id,
      name: primitives.name,
      description: primitives.description,
      members: primitives.members,
      settings: primitives.settings,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    };
  }
}
