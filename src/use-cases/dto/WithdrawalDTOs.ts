import type { Decimal } from 'decimal.js';

export interface WithdrawalInputDTO {
  accountId: string;
  amount: number;
}

export interface WithdrawalOutputDTO {
  transactionId: string;
  accountId: string;
  amount: Decimal;
  executedAt: Date;
}
