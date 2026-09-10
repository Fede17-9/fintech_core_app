import { Decimal } from 'decimal.js';
import {
  InsufficientBalanceError,
  AccountFrozenError,
  InvalidAmountError
} from '../exceptions/FinancialError.js';

export type AccountStatus = 'ACTIVE' | 'FROZEN';

export interface AccountProps {
  id?: string;
  accountNumber: string;
  balance: Decimal; // Blindaje contra el problema de punto flotante
  userId: string;
  status: AccountStatus;
  createdAt?: Date;
}

export class Account {
  private props: AccountProps;

  private constructor(props: AccountProps) {
    this.props = props;
  }

  public static create(props: AccountProps): Account {
    // Invariante Financiera: El sistema prohíbe aperturas de cuentas con deudas iniciales.
    if (props.balance.isNegative()) {
      throw new InvalidAmountError('Una cuenta no puede ser inicializada con saldo negativo.');
    }
    if (!props.createdAt) {
      props.createdAt = new Date();
    }
    return new Account(props);
  }

  get id(): string | undefined { return this.props.id; }
  get accountNumber(): string { return this.props.accountNumber; }
  get balance(): Decimal { return this.props.balance; }
  get userId(): string { return this.props.userId; }
  get status(): AccountStatus { return this.props.status; }
  get createdAt(): Date | undefined { return this.props.createdAt; }

  // --- COMPORTAMIENTOS DEL DOMINIO ---

  public deposit(amount: Decimal): void {
    if (amount.lte(0)) {
      throw new InvalidAmountError('El monto del depósito debe ser estrictamente mayor a cero.');
    }
    // Mutación controlada internamente
    this.props.balance = this.props.balance.plus(amount);
  }

  public withdraw(amount: Decimal): void {
    if (amount.lte(0)) {
      throw new InvalidAmountError('El monto del retiro debe ser estrictamente mayor a cero.');
    }
    if (this.props.status === 'FROZEN') {
      throw new AccountFrozenError(this.id ?? this.accountNumber);
    }
    if (this.props.balance.lessThan(amount)) {
      throw new InsufficientBalanceError(this.id ?? this.accountNumber);
    }
    this.props.balance = this.props.balance.minus(amount);
  }

  public freeze(): void {
    this.props.status = 'FROZEN';
  }

  public unfreeze(): void {
    this.props.status = 'ACTIVE';
  }
}