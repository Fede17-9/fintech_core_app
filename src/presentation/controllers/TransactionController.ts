import type { NextFunction, Request, Response } from 'express';
import { DepositUseCase } from '../../use-cases/DepositUseCase.js';
import { GetBalanceUseCase } from '../../use-cases/GetBalanceUseCase.js';
import { GetTransactionHistoryUseCase } from '../../use-cases/GetTransactionHistoryUseCase.js';
import { TransferMoneyUseCase } from '../../use-cases/TransferMoneyUseCase.js';
import { WithdrawalUseCase } from '../../use-cases/WithdrawalUseCase.js';

export class TransactionController {
  constructor(
    private readonly transferMoneyUseCase: TransferMoneyUseCase,
    private readonly depositUseCase: DepositUseCase,
    private readonly withdrawalUseCase: WithdrawalUseCase,
    private readonly getTransactionHistoryUseCase: GetTransactionHistoryUseCase,
    private readonly getBalanceUseCase: GetBalanceUseCase,
  ) {}

  transfer = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.transferMoneyUseCase.execute(request.body);
      response.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  deposit = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.depositUseCase.execute(request.body);
      const account = await this.getBalanceUseCase.execute({ accountId: result.accountId });
      response.status(201).json({
        status: 'success',
        data: {
          accountId: result.accountId,
          newBalance: account.balance.toNumber(),
          depositedAt: result.executedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  withdrawal = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.withdrawalUseCase.execute(request.body);
      const account = await this.getBalanceUseCase.execute({ accountId: result.accountId });
      response.status(201).json({
        status: 'success',
        data: {
          accountId: result.accountId,
          newBalance: account.balance.toNumber(),
          withdrawnAt: result.executedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  history = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const accountId = request.params.accountId;
      if (typeof accountId !== 'string') {
        response.status(400).json({ status: 'error', code: 'INVALID_ACCOUNT_ID', message: 'La cuenta indicada no es válida.' });
        return;
      }
      const result = await this.getTransactionHistoryUseCase.execute(accountId);
      response.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };
}
