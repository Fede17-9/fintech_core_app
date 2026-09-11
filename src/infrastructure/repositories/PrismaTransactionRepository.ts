import type { PrismaClient } from '../../generated/prisma/client.js';
import type { TransactionRepository } from '../../domain/repositories/Repositories.js';
import { Transaction } from '../../domain/entities/Transaction.js';
import { TransactionMapper } from '../mappers/TransactionMapper.js';

export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(transaction: Transaction): Promise<void> {
    const data = TransactionMapper.toPersistence(transaction);

    if (!transaction.id) {
      await this.prisma.transaction.create({ data });
      return;
    }

    await this.prisma.transaction.upsert({
      where: { id: transaction.id },
      update: {
        ...(data.amount !== undefined ? { amount: data.amount } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.sourceAccountId !== undefined ? { sourceAccountId: data.sourceAccountId } : {}),
        ...(data.destinationAccountId !== undefined ? { destinationAccountId: data.destinationAccountId } : {}),
      },
      create: data,
    });
  }

  async findById(id: string): Promise<Transaction | null> {
    const prismaTransaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!prismaTransaction) return null;

    return TransactionMapper.toDomain(prismaTransaction);
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    const prismaTransactions = await this.prisma.transaction.findMany({
      where: {
        OR: [
          { sourceAccountId: accountId },
          { destinationAccountId: accountId },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return prismaTransactions.map(TransactionMapper.toDomain);
  }
}
