import { randomUUID } from 'node:crypto';
import { Decimal } from 'decimal.js';
import { Withdrawal } from '../domain/entities/Transaction.js';
import { AccountFrozenError, AccountNotFoundError, InsufficientBalanceError } from '../domain/exceptions/FinancialError.js';
import type { AccountRepository } from '../domain/repositories/Repositories.js';
import type { WithdrawalInputDTO, WithdrawalOutputDTO } from './dto/WithdrawalDTOs.js';

export class WithdrawalUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(input: WithdrawalInputDTO): Promise<WithdrawalOutputDTO> {
    const account = await this.accountRepository.findById(input.accountId);
    if (!account) throw new AccountNotFoundError(input.accountId);
    if (account.status === 'FROZEN') throw new AccountFrozenError(input.accountId);

    const amount = new Decimal(input.amount);
    if (account.balance.lessThan(amount)) {
      throw new InsufficientBalanceError(input.accountId);
    }

    const transaction = new Withdrawal(
      {
        id: randomUUID(),
        amount,
        status: 'COMPLETED',
        description: `Retiro de la cuenta ${input.accountId}.`,
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
