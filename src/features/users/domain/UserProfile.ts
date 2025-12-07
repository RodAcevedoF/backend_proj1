import { ValueObject } from '../../../core/domain/ValueObject';

interface UserProfileProps {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
}

/**
 * User Profile Value Object
 * Contains optional user profile information
 */
export class UserProfile extends ValueObject<UserProfileProps> {
  private constructor(props: UserProfileProps) {
    super(props);
  }

  static create(props: UserProfileProps = {}): UserProfile {
    return new UserProfile(props);
  }

  get firstName(): string | undefined {
    return this.props.firstName;
  }

  get lastName(): string | undefined {
    return this.props.lastName;
  }

  get avatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  get bio(): string | undefined {
    return this.props.bio;
  }

  /**
   * Get full name if available
   */
  getFullName(): string | undefined {
    if (this.props.firstName && this.props.lastName) {
      return `${this.props.firstName} ${this.props.lastName}`;
    }
    return this.props.firstName || this.props.lastName;
  }

  /**
   * Get display name (full name or first name)
   */
  getDisplayName(): string {
    return this.getFullName() || this.props.firstName || 'User';
  }

  /**
   * Update profile fields
   */
  update(updates: Partial<UserProfileProps>): UserProfile {
    return new UserProfile({
      ...this.props,
      ...updates,
    });
  }

  toPrimitives() {
    return {
      firstName: this.props.firstName,
      lastName: this.props.lastName,
      avatarUrl: this.props.avatarUrl,
      bio: this.props.bio,
    };
  }
}
