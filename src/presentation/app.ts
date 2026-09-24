import cors from 'cors';
import 'dotenv/config';
import express, { type Application, type ErrorRequestHandler } from 'express';
import { DomainError } from '../domain/exceptions/DomainError.js';
import { InvalidCredentialsError } from '../domain/exceptions/UserError.js';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository.js';
import { BcryptPasswordHasher } from '../infrastructure/services/BcryptPasswordHasher.js';
import { JwtTokenService } from '../infrastructure/services/JwtTokenService.js';
import { LoginUseCase } from '../use-cases/LoginUseCase.js';
import { RegisterUseCase } from '../use-cases/RegisterUseCase.js';
import { AuthController } from './controllers/AuthController.js';
import { createAuthRoutes } from './routes/authRoutes.js';

export const createApp = (prisma: PrismaClient): Application => {
    const userRepository = new PrismaUserRepository(prisma);
    const passwordHasher = new BcryptPasswordHasher();
    const tokenService = new JwtTokenService();
    const registerUseCase = new RegisterUseCase(userRepository, passwordHasher);
    const loginUseCase = new LoginUseCase(userRepository, passwordHasher, tokenService);
    const authController = new AuthController(registerUseCase, loginUseCase);

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get('/health', (_request, response) => {
        response.status(200).json({ status: 'ok' });
    });

    app.use('/api/auth', createAuthRoutes(authController));

    app.use((_request, response) => {
        response.status(404).json({
            status: 'error',
            code: 'NOT_FOUND',
            message: 'Ruta no encontrada.',
        });
    });

    const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
        if (error instanceof InvalidCredentialsError) {
            response.status(401).json({
                status: 'error',
                code: 'INVALID_CREDENTIALS',
                message: error.message,
            });
            return;
        }

        if (error instanceof DomainError) {
            response.status(400).json({
                status: 'error',
                code: error.name,
                message: error.message,
            });
            return;
        }

        console.error(error);
        response.status(500).json({ message: 'Error interno del servidor.' });
    };

    app.use(errorHandler);

    return app;
};