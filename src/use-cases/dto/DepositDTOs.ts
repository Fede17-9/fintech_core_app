import type { Decimal } from 'decimal.js';

export interface DepositInputDTO {
  accountId: string;
  amount: number;
}

export interface DepositOutputDTO {
  transactionId: string;
  accountId: string;
  amount: Decimal;
  executedAt: Date;
}
