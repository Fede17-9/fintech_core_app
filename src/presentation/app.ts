import cors from 'cors';
import 'dotenv/config';
import express, { type Application, type ErrorRequestHandler } from 'express';
import { DomainError } from '../domain/exceptions/DomainError.js';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository.js';
import { LoginUseCase } from '../use-cases/LoginUseCase.js';
import { RegisterUseCase } from '../use-cases/RegisterUseCase.js';
import { AuthController } from './controllers/AuthController.js';
import { createAuthRoutes } from './routes/authRoutes.js';

export const createApp = (prisma: PrismaClient): Application => {
    const userRepository = new PrismaUserRepository(prisma);
    const registerUseCase = new RegisterUseCase(userRepository);
    const loginUseCase = new LoginUseCase(userRepository);
    const authController = new AuthController(registerUseCase, loginUseCase);

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.use('/auth', createAuthRoutes(authController));

    const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
        if (error instanceof DomainError) {
            response.status(400).json({ message: error.message });
            return;
        }

        console.error(error);
        response.status(500).json({ message: 'Error interno del servidor.' });
    };

    app.use(errorHandler);

    return app;
};