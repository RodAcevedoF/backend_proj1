import { LearningResource } from './LearningResource';

/**
 * Roadmap Step Value Object
 * Represents a single step/milestone in a learning roadmap
 */
export interface RoadmapStepProps {
  order: number;
  title: string;
  description: string;
  estimatedWeeks?: number;
  resources: LearningResource[];
  prerequisites?: string[]; // IDs of prerequisite steps
}

export class RoadmapStep {
  private constructor(private readonly props: RoadmapStepProps) {
    this.validate();
  }

  private validate(): void {
    if (this.props.order < 0) {
      throw new Error('Step order must be non-negative');
    }

    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new Error('Step title is required');
    }

    if (this.props.title.length > 200) {
      throw new Error('Step title must be less than 200 characters');
    }

    if (!this.props.description || this.props.description.trim().length === 0) {
      throw new Error('Step description is required');
    }

    if (this.props.estimatedWeeks && this.props.estimatedWeeks < 0) {
      throw new Error('Estimated weeks must be positive');
    }
  }

  static create(props: RoadmapStepProps): RoadmapStep {
    return new RoadmapStep(props);
  }

  get order(): number {
    return this.props.order;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get estimatedWeeks(): number | undefined {
    return this.props.estimatedWeeks;
  }

  get resources(): LearningResource[] {
    return [...this.props.resources];
  }

  get prerequisites(): string[] | undefined {
    return this.props.prerequisites ? [...this.props.prerequisites] : undefined;
  }

  addResource(resource: LearningResource): RoadmapStep {
    return new RoadmapStep({
      ...this.props,
      resources: [...this.props.resources, resource],
    });
  }

  removeResource(resourceTitle: string): RoadmapStep {
    return new RoadmapStep({
      ...this.props,
      resources: this.props.resources.filter((r) => r.title !== resourceTitle),
    });
  }

  toJSON() {
    return {
      order: this.props.order,
      title: this.props.title,
      description: this.props.description,
      estimatedWeeks: this.props.estimatedWeeks,
      resources: this.props.resources.map((r) => r.toJSON()),
      prerequisites: this.props.prerequisites,
    };
  }
}
