import { EntityId } from '@/core/domain/EntityId';

export interface CategoryProps {
  workspaceId: string;
  name: string;
  description?: string;
  color?: string; // Hex color for UI
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category Entity
 * Represents a category for organizing articles and roadmaps within a workspace
 */
export class Category {
  private constructor(
    private readonly _id: EntityId,
    private props: CategoryProps
  ) {}

  static create(
    workspaceId: string,
    name: string,
    createdBy: string,
    options?: { description?: string; color?: string }
  ): Category {
    const now = new Date();
    return new Category(EntityId.create(), {
      workspaceId,
      name: name.trim(),
      description: options?.description,
      color: options?.color,
      createdBy,
      createdAt: now,
      updatedAt: now,
    });
  }

  static from(id: string, props: CategoryProps): Category {
    return new Category(EntityId.from(id), props);
  }

  get id(): string {
    return this._id.toString();
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get color(): string | undefined {
    return this.props.color;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(updates: { name?: string; description?: string; color?: string }): void {
    if (updates.name !== undefined) {
      this.props.name = updates.name.trim();
    }
    if (updates.description !== undefined) {
      this.props.description = updates.description;
    }
    if (updates.color !== undefined) {
      this.props.color = updates.color;
    }
    this.props.updatedAt = new Date();
  }

  toPrimitives() {
    return {
      id: this.id,
      workspaceId: this.props.workspaceId,
      name: this.props.name,
      description: this.props.description,
      color: this.props.color,
      createdBy: this.props.createdBy,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
