import { Decimal } from 'decimal.js';
import type { Transaction as PrismaTransaction, Prisma } from '../../generated/prisma/client.js';
import { TransactionType } from '../../generated/prisma/client.js';
import { Transaction, Deposit, Withdrawal, Transfer } from '../../domain/entities/Transaction.js';

export class TransactionMapper {
  public static toDomain(prismaTx: PrismaTransaction): Transaction {
    const txProps = {
      id: prismaTx.id,
      amount: new Decimal(prismaTx.amount.toString()),
      status: prismaTx.status,
      description: prismaTx.description ?? '',
      createdAt: prismaTx.createdAt,
    };

    switch (prismaTx.type) {
      case TransactionType.DEPOSIT:
        if (!prismaTx.destinationAccountId) {
          throw new Error('Inconsistencia en DB: Deposit requiere destinationAccountId');
        }
        return new Deposit(txProps, prismaTx.destinationAccountId);

      case TransactionType.WITHDRAWAL:
        if (!prismaTx.sourceAccountId) {
          throw new Error('Inconsistencia en DB: Withdrawal requiere sourceAccountId');
        }
        return new Withdrawal(txProps, prismaTx.sourceAccountId);

      case TransactionType.TRANSFER:
        if (!prismaTx.sourceAccountId || !prismaTx.destinationAccountId) {
          throw new Error('Inconsistencia en DB: Transfer requiere ambas cuentas (origen y destino)');
        }
        return new Transfer(txProps, prismaTx.sourceAccountId, prismaTx.destinationAccountId);

      default:
        throw new Error(`Tipo de transacción desconocido o corrupto en DB: ${prismaTx.type}`);
    }
  }

  public static toPersistence(transaction: Transaction): Prisma.TransactionUncheckedCreateInput {
    let type: TransactionType;
    let sourceAccountId: string | null = null;
    let destinationAccountId: string | null = null;

    if (transaction instanceof Deposit) {
      type = TransactionType.DEPOSIT;
      destinationAccountId = transaction.destinationAccount;
    } else if (transaction instanceof Withdrawal) {
      type = TransactionType.WITHDRAWAL;
      sourceAccountId = transaction.sourceAccount;
    } else if (transaction instanceof Transfer) {
      type = TransactionType.TRANSFER;
      sourceAccountId = transaction.sourceAccount;
      destinationAccountId = transaction.destinationAccount;
    } else {
      throw new Error('Instancia de transacción inválida proporcionada al Mapper');
    }

    return {
      id: transaction.id,
      amount: transaction.amount,
      type,
      status: transaction.status,
      description: transaction.description,
      sourceAccountId,
      destinationAccountId,
      createdAt: transaction.createdAt,
    };
  }
}