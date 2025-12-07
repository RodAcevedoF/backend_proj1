/**
 * Password Hashing Port (Outbound)
 * Abstract interface for password hashing operations
 */
export interface IPasswordHasher {
  /**
   * Hash a plain text password
   */
  hash(password: string): Promise<string>;

  /**
   * Compare a plain text password with a hash
   */
  compare(password: string, hash: string): Promise<boolean>;
}
