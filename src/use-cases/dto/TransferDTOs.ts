export interface TransferMoneyInputDTO {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
}

export interface TransferMoneyOutputDTO {
  transactionId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  executedAt: Date;
}
