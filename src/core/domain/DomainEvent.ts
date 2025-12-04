import { randomUUID } from 'crypto';

/**
 * Base interface for all domain events
 */
export interface DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly eventType: string;
}

/**
 * Base class for domain events
 */
export abstract class BaseDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly eventType: string
  ) {
    this.eventId = randomUUID();
    this.occurredAt = new Date();
  }
}
