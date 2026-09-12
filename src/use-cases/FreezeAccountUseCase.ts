import { AccountNotFoundError } from '../domain/exceptions/FinancialError.js';
import type { AccountRepository } from '../domain/repositories/Repositories.js';
import type { AccountOutputDTO } from './dto/AccountDTOs.js';

export class FreezeAccountUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(accountId: string): Promise<AccountOutputDTO> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) throw new AccountNotFoundError(accountId);

    account.freeze();
    await this.accountRepository.update(account);

    if (!account.id || !account.createdAt) {
      throw new Error('La cuenta no tiene los metadatos requeridos.');
    }

    return {
      id: account.id,
      accountNumber: account.accountNumber,
      balance: account.balance,
      status: account.status,
      userId: account.userId,
      createdAt: account.createdAt,
    };
  }
}
