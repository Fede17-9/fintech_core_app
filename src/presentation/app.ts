import cors from 'cors';
import 'dotenv/config';
import express, { type Application, type ErrorRequestHandler } from 'express';
import { DomainError } from '../domain/exceptions/DomainError.js';
import { InvalidCredentialsError } from '../domain/exceptions/UserError.js';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository.js';
import { PrismaAccountRepository } from '../infrastructure/repositories/PrismaAccountRepository.js';
import { PrismaTransactionRepository } from '../infrastructure/repositories/PrismaTransactionRepository.js';
import { BcryptPasswordHasher } from '../infrastructure/services/BcryptPasswordHasher.js';
import { JwtTokenService } from '../infrastructure/services/JwtTokenService.js';
import { CreateAccountUseCase } from '../use-cases/CreateAccountUseCase.js';
import { FreezeAccountUseCase } from '../use-cases/FreezeAccountUseCase.js';
import { GetBalanceUseCase } from '../use-cases/GetBalanceUseCase.js';
import { GetUserAccountsUseCase } from '../use-cases/GetUserAccountsUseCase.js';
import { LoginUseCase } from '../use-cases/LoginUseCase.js';
import { RegisterUseCase } from '../use-cases/RegisterUseCase.js';
import { UnfreezeAccountUseCase } from '../use-cases/UnfreezeAccountUseCase.js';
import { DepositUseCase } from '../use-cases/DepositUseCase.js';
import { GetTransactionHistoryUseCase } from '../use-cases/GetTransactionHistoryUseCase.js';
import { TransferMoneyUseCase } from '../use-cases/TransferMoneyUseCase.js';
import { WithdrawalUseCase } from '../use-cases/WithdrawalUseCase.js';
import { AccountController } from './controllers/AccountController.js';
import { AuthController } from './controllers/AuthController.js';
import { TransactionController } from './controllers/TransactionController.js';
import { createAccountRoutes } from './routes/accountRoutes.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import { createTransactionRoutes } from './routes/transactionRoutes.js';

export const createApp = (prisma: PrismaClient): Application => {
    const userRepository = new PrismaUserRepository(prisma);
    const accountRepository = new PrismaAccountRepository(prisma);
    const transactionRepository = new PrismaTransactionRepository(prisma);
    const passwordHasher = new BcryptPasswordHasher();
    const tokenService = new JwtTokenService();
    const registerUseCase = new RegisterUseCase(userRepository, passwordHasher);
    const loginUseCase = new LoginUseCase(userRepository, passwordHasher, tokenService);
    const authController = new AuthController(registerUseCase, loginUseCase);
    const accountController = new AccountController(
        new GetUserAccountsUseCase(accountRepository),
        new CreateAccountUseCase(accountRepository),
        new GetBalanceUseCase(accountRepository),
        new FreezeAccountUseCase(accountRepository),
        new UnfreezeAccountUseCase(accountRepository),
    );
    const transactionController = new TransactionController(
        new TransferMoneyUseCase(accountRepository),
        new DepositUseCase(accountRepository),
        new WithdrawalUseCase(accountRepository),
        new GetTransactionHistoryUseCase(transactionRepository),
        new GetBalanceUseCase(accountRepository),
    );

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get('/health', (_request, response) => {
        response.status(200).json({ status: 'ok' });
    });

    app.use('/api/auth', createAuthRoutes(authController));
    app.use('/api/accounts', createAccountRoutes(accountController, tokenService));
    app.use('/api/transactions', createTransactionRoutes(transactionController, tokenService));

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