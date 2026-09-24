import type { NextFunction, Request, Response } from 'express';
import { RegisterUseCase } from '../../use-cases/RegisterUseCase.js';
import { LoginUseCase } from '../../use-cases/LoginUseCase.js';

export class AuthController {
    constructor(
        private readonly registerUseCase: RegisterUseCase,
        private readonly loginUseCase: LoginUseCase,
    ) {}

    register = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const { name, fullName, email, password } = request.body as {
                name?: string;
                fullName?: string;
                email?: string;
                password?: string;
            };
            const result = await this.registerUseCase.execute({
                fullName: fullName ?? name ?? '',
                email: email ?? '',
                password: password ?? '',
            });
            response.status(201).json({
                status: 'success',
                data: {
                    id: result.id,
                    name: result.fullName,
                    email: result.email,
                    createdAt: result.createdAt,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    login = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.loginUseCase.execute(request.body);
            response.status(200).json({
                status: 'success',
                data: {
                    token: result.token,
                    user: {
                        id: result.user.id,
                        name: result.user.fullName,
                        email: result.user.email,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    };
}