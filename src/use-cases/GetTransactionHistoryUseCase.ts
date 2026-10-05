import type { TransactionRepository } from '../domain/repositories/Repositories.js';
import { Deposit, Transfer, Withdrawal } from '../domain/entities/Transaction.js';

export interface TransactionHistoryItemOutputDTO {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  status: string;
  description: string;
  createdAt: Date;
  sourceAccountId?: string;
  destinationAccountId?: string;
}

export interface TransactionHistoryOutputDTO {
  accountId: string;
  transactions: TransactionHistoryItemOutputDTO[];
}

export class GetTransactionHistoryUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(accountId: string): Promise<TransactionHistoryOutputDTO> {
    const transactions = await this.transactionRepository.findByAccountId(accountId);

    return {
      accountId,
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction instanceof Deposit
          ? 'DEPOSIT'
          : transaction instanceof Withdrawal
            ? 'WITHDRAWAL'
            : 'TRANSFER',
        amount: transaction.amount.toNumber(),
        status: transaction.status,
        description: transaction.description,
        createdAt: transaction.createdAt,
        ...(transaction instanceof Withdrawal || transaction instanceof Transfer
          ? { sourceAccountId: transaction.sourceAccount }
          : {}),
        ...(transaction instanceof Deposit || transaction instanceof Transfer
          ? { destinationAccountId: transaction.destinationAccount }
          : {}),
      })),
    };
  }
}
