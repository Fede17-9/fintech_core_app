import type { Decimal } from 'decimal.js';

export interface CreateAccountInputDTO {
  userId: string;
  initialBalance?: number;
}

export interface AccountOutputDTO {
  id?: string;
  accountNumber: string;
  balance: Decimal;
  status: string;
  userId: string;
  createdAt?: Date;
}

export interface GetBalanceInputDTO {
  accountId: string;
}
