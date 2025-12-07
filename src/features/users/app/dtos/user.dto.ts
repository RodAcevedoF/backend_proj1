/**
 * Register User DTO
 * Input for user registration
 */
export interface RegisterUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  workspaceName?: string; // Optional initial workspace name
}

/**
 * Login User DTO
 * Input for user authentication
 */
export interface LoginUserDto {
  email: string;
  password: string;
}

/**
 * Update Profile DTO
 * Input for updating user profile
 */
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
}

/**
 * Change Password DTO
 * Input for changing user password
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * User Response DTO
 * Output for user data
 */
export interface UserResponseDto {
  id: string;
  email: string;
  profile: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    bio?: string;
    displayName: string;
  };
  workspaces: Array<{
    workspaceId: string;
    role: string;
    joinedAt: Date;
    isActive: boolean;
  }>;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

/**
 * Auth Response DTO
 * Output for authentication operations
 */
export interface AuthResponseDto {
  user: UserResponseDto;
  sessionId: string; // Used internally, not sent to client
}
