import type { NextFunction, Request, Response } from 'express';
import { CreateAccountUseCase } from '../../use-cases/CreateAccountUseCase.js';
import { FreezeAccountUseCase } from '../../use-cases/FreezeAccountUseCase.js';
import { GetBalanceUseCase } from '../../use-cases/GetBalanceUseCase.js';
import { GetUserAccountsUseCase } from '../../use-cases/GetUserAccountsUseCase.js';
import { UnfreezeAccountUseCase } from '../../use-cases/UnfreezeAccountUseCase.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class AccountController {
  constructor(
    private readonly getUserAccountsUseCase: GetUserAccountsUseCase,
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly getBalanceUseCase: GetBalanceUseCase,
    private readonly freezeAccountUseCase: FreezeAccountUseCase,
    private readonly unfreezeAccountUseCase: UnfreezeAccountUseCase,
  ) {}

  getUserAccounts = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = (request as AuthenticatedRequest).user;
      const accounts = await this.getUserAccountsUseCase.execute(userId);
      response.status(200).json({ status: 'success', data: accounts });
    } catch (error) {
      next(error);
    }
  };

  createAccount = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = (request as AuthenticatedRequest).user;
      const initialBalance = request.body?.initialBalance;
      const account = await this.createAccountUseCase.execute({
        userId,
        ...(typeof initialBalance === 'number' ? { initialBalance } : {}),
      });
      response.status(201).json({ status: 'success', data: account });
    } catch (error) {
      next(error);
    }
  };

  getBalance = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const accountId = request.params.accountId;
      if (typeof accountId !== 'string') {
        response.status(400).json({ status: 'error', code: 'INVALID_ACCOUNT_ID', message: 'La cuenta indicada no es válida.' });
        return;
      }
      const account = await this.getBalanceUseCase.execute({ accountId });
      response.status(200).json({ status: 'success', data: account });
    } catch (error) {
      next(error);
    }
  };

  freeze = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const accountId = request.params.accountId;
      if (typeof accountId !== 'string') {
        response.status(400).json({ status: 'error', code: 'INVALID_ACCOUNT_ID', message: 'La cuenta indicada no es válida.' });
        return;
      }
      const account = await this.freezeAccountUseCase.execute(accountId);
      response.status(200).json({ status: 'success', data: account, message: 'Cuenta congelada correctamente.' });
    } catch (error) {
      next(error);
    }
  };

  unfreeze = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const accountId = request.params.accountId;
      if (typeof accountId !== 'string') {
        response.status(400).json({ status: 'error', code: 'INVALID_ACCOUNT_ID', message: 'La cuenta indicada no es válida.' });
        return;
      }
      const account = await this.unfreezeAccountUseCase.execute(accountId);
      response.status(200).json({ status: 'success', data: account, message: 'Cuenta descongelada correctamente.' });
    } catch (error) {
      next(error);
    }
  };
}
