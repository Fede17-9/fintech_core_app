import { randomUUID } from 'node:crypto';
import { Decimal } from 'decimal.js';
import { Account } from '../domain/entities/Account.js';
import { InvalidAmountError } from '../domain/exceptions/FinancialError.js';
import type { AccountRepository } from '../domain/repositories/Repositories.js';
import type { AccountOutputDTO, CreateAccountInputDTO } from './dto/AccountDTOs.js';

export class CreateAccountUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(input: CreateAccountInputDTO): Promise<AccountOutputDTO> {
    const initialAmount = input.initialBalance ?? 0;

    if (initialAmount < 0) {
      throw new InvalidAmountError('El monto inicial de la cuenta no puede ser negativo.');
    }

    const accountNumber = `ACC-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const newAccount = Account.create({
      id: randomUUID(),
      accountNumber,
      balance: new Decimal(initialAmount),
      userId: input.userId,
      status: 'ACTIVE',
      createdAt: new Date(),
    });

    await this.accountRepository.save(newAccount);

    return {
      id: newAccount.id,
      accountNumber: newAccount.accountNumber,
      balance: newAccount.balance,
      status: newAccount.status,
      userId: newAccount.userId,
      createdAt: newAccount.createdAt,
    };
  }
}
