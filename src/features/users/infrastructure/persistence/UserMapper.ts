import { User } from '../../domain/User';
import { EntityId } from '../../../../core/domain/EntityId';
import { Email } from '../../../../core/domain/Email';
import { UserProfile } from '../../domain/UserProfile';
import { WorkspaceMembership } from '../../domain/WorkspaceMembership';

interface UserDocument {
  _id: string;
  email: string;
  passwordHash: string;
  profile: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    bio?: string;
  };
  workspaces: Array<{
    workspaceId: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    joinedAt: Date;
    membershipStart?: Date;
    membershipEnd?: Date;
  }>;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Mapper
 * Converts between domain User entity and persistence UserDocument
 */
export class UserMapper {
  /**
   * Convert persistence document to domain entity
   */
  static toDomain(doc: UserDocument): User {
    const workspaces = doc.workspaces.map((ws) =>
      WorkspaceMembership.fromPrimitives({
        workspaceId: ws.workspaceId,
        role: ws.role,
        joinedAt: ws.joinedAt,
        membershipStart: ws.membershipStart,
        membershipEnd: ws.membershipEnd,
      })
    );

    return User.from(EntityId.from(doc._id), {
      email: Email.create(doc.email),
      passwordHash: doc.passwordHash,
      profile: UserProfile.create(doc.profile),
      workspaces,
      isEmailVerified: doc.isEmailVerified,
      lastLoginAt: doc.lastLoginAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /**
   * Convert domain entity to persistence document
   */
  static toPersistence(user: User): UserDocument {
    const primitives = user.toPrimitives();

    return {
      _id: primitives.id,
      email: primitives.email,
      passwordHash: primitives.passwordHash,
      profile: primitives.profile,
      workspaces: primitives.workspaces,
      isEmailVerified: primitives.isEmailVerified,
      lastLoginAt: primitives.lastLoginAt,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    };
  }
}
