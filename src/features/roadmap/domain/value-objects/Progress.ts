/**
 * Progress Value Object
 * Tracks user progress on a roadmap step
 */
export interface ProgressProps {
  userId: string;
  stepOrder: number;
  completedAt?: Date;
  completedResources: string[]; // Resource titles
  notes?: string;
}

export class Progress {
  private constructor(private readonly props: ProgressProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.userId || this.props.userId.trim().length === 0) {
      throw new Error('User ID is required for progress tracking');
    }

    if (this.props.stepOrder < 0) {
      throw new Error('Step order must be non-negative');
    }
  }

  static create(props: ProgressProps): Progress {
    return new Progress(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get stepOrder(): number {
    return this.props.stepOrder;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  get completedResources(): string[] {
    return [...this.props.completedResources];
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get isCompleted(): boolean {
    return this.props.completedAt !== undefined;
  }

  markResourceComplete(resourceTitle: string): Progress {
    if (this.props.completedResources.includes(resourceTitle)) {
      return this;
    }

    return new Progress({
      ...this.props,
      completedResources: [...this.props.completedResources, resourceTitle],
    });
  }

  markStepComplete(): Progress {
    return new Progress({
      ...this.props,
      completedAt: new Date(),
    });
  }

  addNotes(notes: string): Progress {
    return new Progress({
      ...this.props,
      notes,
    });
  }

  toJSON() {
    return {
      userId: this.props.userId,
      stepOrder: this.props.stepOrder,
      completedAt: this.props.completedAt?.toISOString(),
      completedResources: this.props.completedResources,
      notes: this.props.notes,
    };
  }
}
