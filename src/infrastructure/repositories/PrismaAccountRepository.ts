import type { PrismaClient } from '../../generated/prisma/client.js';
import type { AccountRepository } from '../../domain/repositories/Repositories.js';
import { Account } from '../../domain/entities/Account.js';
import { Deposit, Transfer, Withdrawal } from '../../domain/entities/Transaction.js';
import { AccountFrozenError, InsufficientBalanceError } from '../../domain/exceptions/FinancialError.js';
import { AccountMapper } from '../mappers/AccountMapper.js';
import { TransactionMapper } from '../mappers/TransactionMapper.js';

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

  async executeTransaction(transaction: import('../../domain/entities/Transaction.js').Transaction): Promise<import('../../domain/entities/Transaction.js').Transaction> {
    return this.prisma.$transaction(async (tx) => {
      if (transaction instanceof Transfer || transaction instanceof Withdrawal) {
        const sourceAccountId = transaction.sourceAccount;
        const debited = await tx.account.updateMany({
          where: {
            id: sourceAccountId,
            status: 'ACTIVE',
            balance: { gte: transaction.amount },
          },
          data: { balance: { decrement: transaction.amount } },
        });

        if (debited.count === 0) {
          const sourceAccount = await tx.account.findUnique({ where: { id: sourceAccountId } });
          if (sourceAccount?.status === 'FROZEN') {
            throw new AccountFrozenError(sourceAccountId);
          }
          throw new InsufficientBalanceError(sourceAccountId);
        }
      }

      if (transaction instanceof Transfer || transaction instanceof Deposit) {
        const destinationAccountId = transaction.destinationAccount;
        await tx.account.update({
          where: { id: destinationAccountId },
          data: { balance: { increment: transaction.amount } },
        });
      }

      const transactionRecord = await tx.transaction.create({
        data: TransactionMapper.toPersistence(transaction),
      });

      return TransactionMapper.toDomain(transactionRecord);
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