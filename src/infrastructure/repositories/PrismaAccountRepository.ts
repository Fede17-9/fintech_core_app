import type { PrismaClient } from '../../generated/prisma/client.js';
import type { AccountRepository } from '../../domain/repositories/Repositories.js';
import { Account } from '../../domain/entities/Account.js';
import { AccountMapper } from '../mappers/AccountMapper.js';

export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(account: Account): Promise<void> {
    const data = AccountMapper.toPersistence(account);

    if (!account.id) {
      await this.prisma.account.create({ data });
      return;
    }

    await this.prisma.account.upsert({
      where: { id: account.id },
      update: {
        ...(data.balance !== undefined ? { balance: data.balance } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
      create: data,
    });
  }

  async update(account: Account): Promise<void> {
    if (!account.id) {
      throw new Error('No se puede actualizar una cuenta sin id.');
    }

    const data = AccountMapper.toPersistence(account);

    await this.prisma.account.update({
      where: { id: account.id },
      data: {
        ...(data.balance !== undefined ? { balance: data.balance } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });
  }

  async findById(id: string): Promise<Account | null> {
    const prismaAccount = await this.prisma.account.findUnique({
      where: { id },
    });

    if (!prismaAccount) return null;

    return AccountMapper.toDomain(prismaAccount);
  }

  async findByAccountNumber(accountNumber: string): Promise<Account | null> {
    const prismaAccount = await this.prisma.account.findUnique({
      where: { accountNumber },
    });

    if (!prismaAccount) return null;

    return AccountMapper.toDomain(prismaAccount);
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const prismaAccounts = await this.prisma.account.findMany({
      where: { userId },
    });

    return prismaAccounts.map(AccountMapper.toDomain);
  }
}