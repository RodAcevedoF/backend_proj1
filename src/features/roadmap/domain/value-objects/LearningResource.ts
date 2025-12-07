/**
 * Learning Resource Value Object
 * Represents a study material (video, article, exercise, etc.)
 */
export interface LearningResourceProps {
  title: string;
  type: 'video' | 'article' | 'book' | 'exercise' | 'course' | 'paper';
  url?: string;
  description?: string;
  estimatedDuration?: number; // in minutes
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export class LearningResource {
  private constructor(private readonly props: LearningResourceProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new Error('Learning resource title is required');
    }

    if (this.props.title.length > 200) {
      throw new Error(
        'Learning resource title must be less than 200 characters'
      );
    }

    if (this.props.url && !this.isValidUrl(this.props.url)) {
      throw new Error('Invalid URL format');
    }

    if (this.props.estimatedDuration && this.props.estimatedDuration < 0) {
      throw new Error('Estimated duration must be positive');
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static create(props: LearningResourceProps): LearningResource {
    return new LearningResource(props);
  }

  get title(): string {
    return this.props.title;
  }

  get type(): string {
    return this.props.type;
  }

  get url(): string | undefined {
    return this.props.url;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get estimatedDuration(): number | undefined {
    return this.props.estimatedDuration;
  }

  get difficulty(): string | undefined {
    return this.props.difficulty;
  }

  toJSON() {
    return {
      title: this.props.title,
      type: this.props.type,
      url: this.props.url,
      description: this.props.description,
      estimatedDuration: this.props.estimatedDuration,
      difficulty: this.props.difficulty,
    };
  }

  equals(other: LearningResource): boolean {
    return (
      this.props.title === other.title &&
      this.props.type === other.type &&
      this.props.url === other.url
    );
  }
}
