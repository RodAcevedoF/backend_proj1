import { User, AuthProvider } from '@/features/users/domain/User';
import { EntityId } from '@/core/domain/EntityId';
import { Email } from '@/core/domain/Email';
import { UserProfile } from '@/features/users/domain/UserProfile';
import { WorkspaceMembership } from '@/features/users/domain/WorkspaceMembership';

interface UserDocument {
  _id: string;
  email: string;
  passwordHash?: string;
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
  // Auth provider fields
  authProvider: AuthProvider;
  oauthId?: string;
  // Email verification fields
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  // Password reset fields
  passwordResetToken?: string;
  passwordResetExpires?: Date;
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
      passwordHash: doc.passwordHash || '', // Empty for OAuth users
      profile: UserProfile.create(doc.profile),
      workspaces,
      isEmailVerified: doc.isEmailVerified,
      lastLoginAt: doc.lastLoginAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      authProvider: doc.authProvider || 'email',
      oauthId: doc.oauthId,
      emailVerificationToken: doc.emailVerificationToken,
      emailVerificationExpires: doc.emailVerificationExpires,
      passwordResetToken: doc.passwordResetToken,
      passwordResetExpires: doc.passwordResetExpires,
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
      authProvider: primitives.authProvider,
      oauthId: primitives.oauthId,
      emailVerificationToken: primitives.emailVerificationToken,
      emailVerificationExpires: primitives.emailVerificationExpires,
      passwordResetToken: primitives.passwordResetToken,
      passwordResetExpires: primitives.passwordResetExpires,
    };
  }
}
