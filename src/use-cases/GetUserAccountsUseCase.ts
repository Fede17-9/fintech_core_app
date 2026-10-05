import type { AccountRepository } from '../domain/repositories/Repositories.js';
import type { AccountOutputDTO } from './dto/AccountDTOs.js';

export class GetUserAccountsUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(userId: string): Promise<AccountOutputDTO[]> {
    const accounts = await this.accountRepository.findByUserId(userId);

    return accounts.flatMap((account) => {
      if (!account.id || !account.createdAt) return [];

      return [{
        id: account.id,
        accountNumber: account.accountNumber,
        balance: account.balance,
        status: account.status,
        userId: account.userId,
        createdAt: account.createdAt,
      }];
    });
  }
}
