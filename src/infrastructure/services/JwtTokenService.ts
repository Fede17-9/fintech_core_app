import jwt from 'jsonwebtoken';
import type { TokenPayload, TokenService } from '../../domain/services/TokenService.js';

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret = process.env.JWT_SECRET ?? 'development-secret',
    private readonly expiresIn: NonNullable<jwt.SignOptions['expiresIn']> = '1h',
  ) {}

  generate(payload: TokenPayload): string {
    const options: jwt.SignOptions = { expiresIn: this.expiresIn };
    return jwt.sign(payload, this.secret, options);
  }

  verify(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.secret);

    if (typeof decoded !== 'object' || decoded === null || typeof decoded.sub !== 'string' || typeof decoded.email !== 'string') {
      throw new Error('Token JWT inválido.');
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
    };
  }
}
