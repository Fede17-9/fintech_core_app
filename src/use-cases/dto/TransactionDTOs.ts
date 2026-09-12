import type { Decimal } from 'decimal.js';

export interface AccountTransactionInputDTO {
  accountId: string;
  amount: number;
}

export interface TransactionOutputDTO {
  transactionId: string;
  accountId: string;
  amount: Decimal;
  executedAt: Date;
}
