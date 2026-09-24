import * as bcrypt from 'bcrypt';
import type { PasswordHasher } from '../../domain/services/PasswordHasher.js';

export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly saltRounds = 12) {}

  hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  compare(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
