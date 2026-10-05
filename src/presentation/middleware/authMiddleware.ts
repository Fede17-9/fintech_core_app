import type { NextFunction, Request, Response } from 'express';
import { JwtTokenService } from '../../infrastructure/services/JwtTokenService.js';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

export const createAuthMiddleware = (tokenService: JwtTokenService) => (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const authorization = request.header('Authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null;

  if (!token) {
    response.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Se requiere un token de autenticación.',
    });
    return;
  }

  try {
    const payload = tokenService.verify(token);
    (request as AuthenticatedRequest).user = {
      userId: payload.sub,
      email: payload.email,
    };
    next();
  } catch {
    response.status(401).json({
      status: 'error',
      code: 'INVALID_TOKEN',
      message: 'El token de autenticación no es válido.',
    });
  }
};
