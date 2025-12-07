import { AggregateRoot } from '@/core/domain/AggregateRoot';
import { EntityId } from '@/core/domain/EntityId';
import { RoadmapStep } from './value-objects/roadmap-step';
import { Progress } from './value-objects/progress';

/**
 * Roadmap Aggregate Root
 * Represents an AI-generated learning roadmap for a workspace
 */
export interface RoadmapProps {
  id: EntityId;
  workspaceId: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
  progress: Progress[];
  sourceArticleIds: string[]; // Articles used to generate the roadmap
  generatedBy: 'ai' | 'manual';
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

export class Roadmap extends AggregateRoot {
  private constructor(private props: RoadmapProps) {
    super(props.id);
    this.validate();
  }

  private validate(): void {
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new Error('Roadmap title is required');
    }

    if (this.props.title.length > 200) {
      throw new Error('Roadmap title must be less than 200 characters');
    }

    if (!this.props.description || this.props.description.trim().length === 0) {
      throw new Error('Roadmap description is required');
    }

    if (!this.props.workspaceId) {
      throw new Error('Workspace ID is required');
    }

    if (!this.props.createdBy) {
      throw new Error('Creator ID is required');
    }
  }

  static create(
    props: Omit<RoadmapProps, 'id' | 'createdAt' | 'updatedAt'>
  ): Roadmap {
    return new Roadmap({
      ...props,
      id: EntityId.create(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: RoadmapProps): Roadmap {
    return new Roadmap(props);
  }

  // Getters
  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get steps(): RoadmapStep[] {
    return [...this.props.steps];
  }

  get progress(): Progress[] {
    return [...this.props.progress];
  }

  get sourceArticleIds(): string[] {
    return [...this.props.sourceArticleIds];
  }

  get generatedBy(): 'ai' | 'manual' {
    return this.props.generatedBy;
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

  get isPublished(): boolean {
    return this.props.isPublished;
  }

  // Business Logic Methods

  updateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }
    this.props.title = title;
    this.props.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Description cannot be empty');
    }
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  addStep(step: RoadmapStep): void {
    // Validate step order
    const existingOrders = this.props.steps.map((s) => s.order);
    if (existingOrders.includes(step.order)) {
      throw new Error(`Step with order ${step.order} already exists`);
    }

    this.props.steps.push(step);
    this.props.steps.sort((a, b) => a.order - b.order);
    this.props.updatedAt = new Date();
  }

  removeStep(order: number): void {
    const index = this.props.steps.findIndex((s) => s.order === order);
    if (index === -1) {
      throw new Error(`Step with order ${order} not found`);
    }

    this.props.steps.splice(index, 1);
    this.props.updatedAt = new Date();
  }

  updateStep(order: number, updatedStep: RoadmapStep): void {
    const index = this.props.steps.findIndex((s) => s.order === order);
    if (index === -1) {
      throw new Error(`Step with order ${order} not found`);
    }

    this.props.steps[index] = updatedStep;
    this.props.updatedAt = new Date();
  }

  markResourceComplete(
    userId: string,
    stepOrder: number,
    resourceTitle: string
  ): void {
    const progressIndex = this.props.progress.findIndex(
      (p) => p.userId === userId && p.stepOrder === stepOrder
    );

    if (progressIndex === -1) {
      // Create new progress entry
      const newProgress = Progress.create({
        userId,
        stepOrder,
        completedResources: [resourceTitle],
      });
      this.props.progress.push(newProgress);
    } else {
      // Update existing progress
      this.props.progress[progressIndex] =
        this.props.progress[progressIndex].markResourceComplete(resourceTitle);
    }

    this.props.updatedAt = new Date();
  }

  markStepComplete(userId: string, stepOrder: number): void {
    const progressIndex = this.props.progress.findIndex(
      (p) => p.userId === userId && p.stepOrder === stepOrder
    );

    if (progressIndex === -1) {
      const newProgress = Progress.create({
        userId,
        stepOrder,
        completedResources: [],
        completedAt: new Date(),
      }).markStepComplete();
      this.props.progress.push(newProgress);
    } else {
      this.props.progress[progressIndex] =
        this.props.progress[progressIndex].markStepComplete();
    }

    this.props.updatedAt = new Date();
  }

  addProgressNotes(userId: string, stepOrder: number, notes: string): void {
    const progressIndex = this.props.progress.findIndex(
      (p) => p.userId === userId && p.stepOrder === stepOrder
    );

    if (progressIndex === -1) {
      const newProgress = Progress.create({
        userId,
        stepOrder,
        completedResources: [],
        notes,
      });
      this.props.progress.push(newProgress);
    } else {
      this.props.progress[progressIndex] =
        this.props.progress[progressIndex].addNotes(notes);
    }

    this.props.updatedAt = new Date();
  }

  publish(): void {
    if (this.props.steps.length === 0) {
      throw new Error('Cannot publish roadmap without steps');
    }
    this.props.isPublished = true;
    this.props.updatedAt = new Date();
  }

  unpublish(): void {
    this.props.isPublished = false;
    this.props.updatedAt = new Date();
  }

  getUserProgress(userId: string): Progress[] {
    return this.props.progress.filter((p) => p.userId === userId);
  }

  getCompletionPercentage(userId: string): number {
    if (this.props.steps.length === 0) return 0;

    const userProgress = this.getUserProgress(userId);
    const completedSteps = userProgress.filter((p) => p.isCompleted).length;

    return Math.round((completedSteps / this.props.steps.length) * 100);
  }

  toPrimitives() {
    return {
      id: this.id.toString(),
      workspaceId: this.props.workspaceId,
      title: this.props.title,
      description: this.props.description,
      steps: this.props.steps.map((s) => s.toJSON()),
      progress: this.props.progress.map((p) => p.toJSON()),
      sourceArticleIds: this.props.sourceArticleIds,
      generatedBy: this.props.generatedBy,
      createdBy: this.props.createdBy,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
      isPublished: this.props.isPublished,
    };
  }
}
