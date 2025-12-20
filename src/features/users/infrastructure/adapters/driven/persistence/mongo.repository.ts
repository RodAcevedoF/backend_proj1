import { IUserRepository } from '@/features/users/domain/ports/outbound/iuser.repository';
import { User } from '@/features/users/domain/User';
import { EntityId } from '@/core/domain/EntityId';
import { Email } from '@/core/domain/Email';
import { UserModel } from './user.schema';
import { UserMapper } from './user.mapper';

/**
 * MongoDB implementation of User Repository
 * Adapter for the outbound port (hexagonal architecture)
 */
export class MongoUserRepository implements IUserRepository {
  async findById(id: EntityId): Promise<User | null> {
    const doc = await UserModel.findOne({ _id: id.toString() }).lean();
    if (!doc) return null;
    return UserMapper.toDomain(
      doc as Parameters<typeof UserMapper.toDomain>[0]
    );
  }

  async findByEmail(email: Email): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toString() }).lean();
    if (!doc) return null;
    return UserMapper.toDomain(
      doc as Parameters<typeof UserMapper.toDomain>[0]
    );
  }

  async findByOAuthId(oauthId: string): Promise<User | null> {
    const doc = await UserModel.findOne({ oauthId }).lean();
    if (!doc) return null;
    return UserMapper.toDomain(
      doc as Parameters<typeof UserMapper.toDomain>[0]
    );
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const doc = await UserModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    }).lean();
    if (!doc) return null;
    return UserMapper.toDomain(
      doc as Parameters<typeof UserMapper.toDomain>[0]
    );
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const doc = await UserModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).lean();
    if (!doc) return null;
    return UserMapper.toDomain(
      doc as Parameters<typeof UserMapper.toDomain>[0]
    );
  }

  async findByWorkspaceId(workspaceId: EntityId): Promise<User[]> {
    const docs = await UserModel.find({
      'workspaces.workspaceId': workspaceId.toString(),
    }).lean();

    return docs.map((doc) =>
      UserMapper.toDomain(doc as Parameters<typeof UserMapper.toDomain>[0])
    );
  }

  async save(user: User): Promise<void> {
    const doc = UserMapper.toPersistence(user);

    await UserModel.updateOne({ _id: doc._id }, doc, {
      upsert: true,
    });

    // TODO: Publish domain events
    // const events = user.domainEvents;
    // await this.eventDispatcher.dispatch(events);
    // user.clearEvents();
  }

  async delete(id: EntityId): Promise<void> {
    await UserModel.deleteOne({ _id: id.toString() });
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await UserModel.countDocuments({
      email: email.toString(),
    });
    return count > 0;
  }
}
