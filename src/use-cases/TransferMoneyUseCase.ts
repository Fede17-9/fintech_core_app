import { Decimal } from 'decimal.js';
import { InvalidPropValueError } from '../domain/exceptions/DomainError.js';
import {
  AccountFrozenError,
  AccountNotFoundError,
  InsufficientBalanceError,
  InvalidAmountError,
} from '../domain/exceptions/FinancialError.js';
import type { AccountRepository } from '../domain/repositories/Repositories.js';
import { Transfer } from '../domain/entities/Transaction.js';
import type { TransferMoneyInputDTO, TransferMoneyOutputDTO } from './dto/TransferDTOs.js';

export class TransferMoneyUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(input: TransferMoneyInputDTO): Promise<TransferMoneyOutputDTO> {
    const { sourceAccountId, destinationAccountId, amount } = input;

    if (amount <= 0) {
      throw new InvalidAmountError('El monto de la transferencia debe ser estrictamente mayor a cero.');
    }

    if (sourceAccountId === destinationAccountId) {
      throw new InvalidPropValueError('La cuenta de origen y destino no pueden ser idénticas.');
    }

    const transferAmount = new Decimal(amount);

    const sourceAccount = await this.accountRepository.findById(sourceAccountId);
    if (!sourceAccount) {
      throw new AccountNotFoundError(sourceAccountId);
    }

    if (sourceAccount.status === 'FROZEN') {
      throw new AccountFrozenError(sourceAccountId);
    }

    if (sourceAccount.balance.lessThan(transferAmount)) {
      throw new InsufficientBalanceError(sourceAccountId);
    }

    const destinationAccount = await this.accountRepository.findById(destinationAccountId);
    if (!destinationAccount) {
      throw new AccountNotFoundError(destinationAccountId);
    }

    const transactionEntity = new Transfer(
      {
        id: crypto.randomUUID(),
        amount: transferAmount,
        status: 'COMPLETED',
        description: `Transferencia de ${transferAmount.toNumber()} desde ${sourceAccountId} hacia ${destinationAccountId}.`,
        createdAt: new Date(),
      },
      sourceAccountId,
      destinationAccountId,
    );

    const savedTransaction = await this.accountRepository.executeTransaction(transactionEntity);

    return {
      transactionId: savedTransaction.id,
      sourceAccountId,
      destinationAccountId,
      amount: transferAmount.toNumber(),
      executedAt: new Date(),
    };
  }
}
