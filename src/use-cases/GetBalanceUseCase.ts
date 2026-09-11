import { AccountNotFoundError } from '../domain/exceptions/FinancialError.js';
import type { AccountRepository } from '../domain/repositories/Repositories.js';
import type { GetBalanceInputDTO, AccountOutputDTO } from './dto/AccountDTOs.js';

export class GetBalanceUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(input: GetBalanceInputDTO): Promise<AccountOutputDTO> {
    const account = await this.accountRepository.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundError(input.accountId);
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
