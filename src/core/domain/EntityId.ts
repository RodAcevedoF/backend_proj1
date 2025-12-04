import { randomUUID } from 'crypto';

/**
 * Unique identifier for entities
 * Ensures type safety and validation
 */
export class EntityId {
  private readonly value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('EntityId cannot be empty');
    }
    this.value = value;
  }

  /**
   * Create a new unique ID
   */
  static create(): EntityId {
    return new EntityId(randomUUID());
  }

  /**
   * Create from existing ID string
   */
  static from(id: string): EntityId {
    return new EntityId(id);
  }

  /**
   * Check equality
   */
  equals(other: EntityId): boolean {
    if (!(other instanceof EntityId)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Get string representation
   */
  toString(): string {
    return this.value;
  }

  /**
   * Get raw value
   */
  toValue(): string {
    return this.value;
  }
}
