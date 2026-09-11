import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Decimal } from 'decimal.js';
import { Account } from '../../src/domain/entities/Account.js';
import { AccountFrozenError, InsufficientBalanceError, InvalidAmountError } from '../../src/domain/exceptions/FinancialError.js';
import type { AccountRepository } from '../../src/domain/repositories/Repositories.js';
import { TransferMoneyUseCase } from '../../src/use-cases/TransferMoneyUseCase.js';

describe('TransferMoneyUseCase', () => {
  let mockAccountRepository: AccountRepository;
  let useCase: TransferMoneyUseCase;

  beforeEach(() => {
    mockAccountRepository = {
      findById: vi.fn(),
      findByAccountNumber: vi.fn(),
      findByUserId: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      executeTransaction: vi.fn(),
    } as unknown as AccountRepository;

    useCase = new TransferMoneyUseCase(mockAccountRepository);
  });

  it('debería transferir fondos exitosamente si todos los requisitos se cumplen', async () => {
    const sourceAccount = Account.create({
      id: 'acc-1',
      accountNumber: 'ACC-100',
      balance: new Decimal(500),
      userId: 'user-1',
      status: 'ACTIVE',
      createdAt: new Date(),
    });

    const destinationAccount = Account.create({
      id: 'acc-2',
      accountNumber: 'ACC-200',
      balance: new Decimal(100),
      userId: 'user-2',
      status: 'ACTIVE',
      createdAt: new Date(),
    });

    vi.mocked(mockAccountRepository.findById).mockImplementation(async (id) => {
      if (id === 'acc-1') return sourceAccount;
      if (id === 'acc-2') return destinationAccount;
      return null;
    });

    vi.mocked(mockAccountRepository.executeTransaction).mockResolvedValue({
      id: 'tx-999',
      amount: new Decimal(200),
      status: 'COMPLETED',
      description: 'transfer',
      createdAt: new Date(),
    } as any);

    const result = await useCase.execute({
      sourceAccountId: 'acc-1',
      destinationAccountId: 'acc-2',
      amount: 200,
    });

    expect(result.transactionId).toBe('tx-999');
    expect(mockAccountRepository.executeTransaction).toHaveBeenCalledTimes(1);
  });

  it('debería lanzar InvalidAmountError si el monto es menor o igual a cero', async () => {
    await expect(
      useCase.execute({ sourceAccountId: 'acc-1', destinationAccountId: 'acc-2', amount: 0 }),
    ).rejects.toThrow(InvalidAmountError);
  });

  it('debería lanzar InsufficientBalanceError si la cuenta origen no tiene saldo suficiente', async () => {
    const sourceAccount = Account.create({
      id: 'acc-1',
      accountNumber: 'ACC-100',
      balance: new Decimal(50),
      userId: 'user-1',
      status: 'ACTIVE',
      createdAt: new Date(),
    });

    const destinationAccount = Account.create({
      id: 'acc-2',
      accountNumber: 'ACC-200',
      balance: new Decimal(100),
      userId: 'user-2',
      status: 'ACTIVE',
      createdAt: new Date(),
    });

    vi.mocked(mockAccountRepository.findById).mockImplementation(async (id) => {
      if (id === 'acc-1') return sourceAccount;
      if (id === 'acc-2') return destinationAccount;
      return null;
    });

    await expect(
      useCase.execute({ sourceAccountId: 'acc-1', destinationAccountId: 'acc-2', amount: 100 }),
    ).rejects.toThrow(InsufficientBalanceError);
  });

  it('debería lanzar AccountFrozenError si la cuenta de origen está congelada', async () => {
    const sourceAccount = Account.create({
      id: 'acc-1',
      accountNumber: 'ACC-100',
      balance: new Decimal(500),
      userId: 'user-1',
      status: 'FROZEN',
      createdAt: new Date(),
    });

    const destinationAccount = Account.create({
      id: 'acc-2',
      accountNumber: 'ACC-200',
      balance: new Decimal(100),
      userId: 'user-2',
      status: 'ACTIVE',
      createdAt: new Date(),
    });

    vi.mocked(mockAccountRepository.findById).mockImplementation(async (id) => {
      if (id === 'acc-1') return sourceAccount;
      if (id === 'acc-2') return destinationAccount;
      return null;
    });

    await expect(
      useCase.execute({ sourceAccountId: 'acc-1', destinationAccountId: 'acc-2', amount: 100 }),
    ).rejects.toThrow(AccountFrozenError);
  });
});
