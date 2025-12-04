import { ValueObject } from './ValueObject';

interface DateRangeProps {
  start: Date;
  end?: Date;
}

export class DateRange extends ValueObject<DateRangeProps> {
  private constructor(props: DateRangeProps) {
    super(props);
  }

  static create(start: Date, end?: Date): DateRange {
    if (end && start > end) {
      throw new Error('Start date must be before end date');
    }
    return new DateRange({ start, end });
  }

  get start(): Date {
    return this.props.start;
  }

  get end(): Date | undefined {
    return this.props.end;
  }

  isActive(): boolean {
    const now = new Date();
    return (
      this.props.start <= now && (!this.props.end || now <= this.props.end)
    );
  }

  /**
   * Check if a date falls within this range
   */
  contains(date: Date): boolean {
    return (
      this.props.start <= date && (!this.props.end || date <= this.props.end)
    );
  }

  /**
   * Get duration in days
   */
  getDurationInDays(): number | null {
    if (!this.props.end) return null;
    const diff = this.props.end.getTime() - this.props.start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
