import { EntityId } from './EntityId';

/**
 * Base class for all Entities
 * Entities are identified by their ID, not their properties
 */
export abstract class Entity {
  protected readonly _id: EntityId;

  constructor(id: EntityId) {
    this._id = id;
  }

  get id(): EntityId {
    return this._id;
  }

  /**
   * Entities are equal if they have the same ID
   */
  equals(entity?: Entity): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this._id.equals(entity._id);
  }
}
