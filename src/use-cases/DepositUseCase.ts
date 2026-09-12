import { randomUUID } from 'node:crypto';
import { Decimal } from 'decimal.js';
import { Deposit } from '../domain/entities/Transaction.js';
import { AccountFrozenError, AccountNotFoundError } from '../domain/exceptions/FinancialError.js';
import type { AccountRepository } from '../domain/repositories/Repositories.js';
import type { DepositInputDTO, DepositOutputDTO } from './dto/DepositDTOs.js';

export class DepositUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(input: DepositInputDTO): Promise<DepositOutputDTO> {
    const account = await this.accountRepository.findById(input.accountId);
    if (!account) throw new AccountNotFoundError(input.accountId);
    if (account.status === 'FROZEN') throw new AccountFrozenError(input.accountId);

    const amount = new Decimal(input.amount);
    const transaction = new Deposit(
      {
        id: randomUUID(),
        amount,
        status: 'COMPLETED',
        description: `Depósito en la cuenta ${input.accountId}.`,
        createdAt: new Date(),
      },
      input.accountId,
    );

    const savedTransaction = await this.accountRepository.executeTransaction(transaction);
    return {
      transactionId: savedTransaction.id,
      accountId: input.accountId,
      amount: savedTransaction.amount,
      executedAt: savedTransaction.createdAt,
    };
  }
}
