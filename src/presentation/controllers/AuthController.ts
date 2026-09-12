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
            const result = await this.registerUseCase.execute(request.body);
            response.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    login = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.loginUseCase.execute(request.body);
            response.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}