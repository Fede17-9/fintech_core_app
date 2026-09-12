import express, { type Application } from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository.js';
import { LoginUseCase } from '../use-cases/LoginUseCase.js';
import { RegisterUseCase } from '../use-cases/RegisterUseCase.js';
import { AuthController } from './controllers/AuthController.js';

export const createApp = (prisma: PrismaClient): Application => {
    const userRepository = new PrismaUserRepository(prisma);
    const registerUseCase = new RegisterUseCase(userRepository);
    const loginUseCase = new LoginUseCase(userRepository);
    const authController = new AuthController(registerUseCase, loginUseCase);

    const app = express();
    app.use(express.json());

    app.post('/auth/register', authController.register);
    app.post('/auth/login', authController.login);

    return app;
};