import bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../domain/ports/IPasswordHasher';

/**
 * Bcrypt implementation of Password Hasher
 * Adapter for password hashing port
 */
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds;
  }

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
