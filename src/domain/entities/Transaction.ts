import { Decimal } from 'decimal.js';
import { DomainError } from '../exceptions/DomainError.js';
import { InvalidAmountError, SameAccountTransferError } from '../exceptions/FinancialError.js';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface TransactionProps {
  id: string;
  amount: Decimal;
  status: TransactionStatus;
  description: string;
  createdAt: Date;
}

/**
 * Clase Abstracta Base: Define el esqueleto y las reglas universales
 * para cualquier movimiento de dinero en la plataforma.
 */
export abstract class Transaction {
  protected props: TransactionProps;

  constructor(props: TransactionProps) {
    // Invariante universal: Nadie procesa transacciones de $0 o sumas negativas.
    if (props.amount.lte(0)) {
        throw new InvalidAmountError("El volumen monetario transaccional debe ser mayor a cero.");
    }
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get amount(): Decimal { return this.props.amount; }
  get status(): TransactionStatus { return this.props.status; }
  get description(): string { return this.props.description; }
  get createdAt(): Date { return this.props.createdAt; }
  
  public markAsCompleted(): void {
    this.props.status = 'COMPLETED';
  }

  public markAsFailed(): void {
    this.props.status = 'FAILED';
  }

  /**
   * POLIMORFISMO: Cada tipo de transacción (Depósito, Retiro) tendrá
   * su propia forma de ejecutarse en el futuro.
   */
  abstract execute(): void;
}

// ==========================================
// SUBCLASES (Extensiones del Dominio)
// ==========================================

export class Deposit extends Transaction {
  private destinationAccountId: string;

  constructor(props: TransactionProps, destinationId: string) {
    super(props);
    this.destinationAccountId = destinationId;
  }

  get destinationAccount(): string { return this.destinationAccountId; }

  execute(): void {
    // Lógica futura específica para depósitos
    this.markAsCompleted();
  }
}

export class Withdrawal extends Transaction {
  private sourceAccountId: string;

  constructor(props: TransactionProps, sourceId: string) {
    super(props);
    this.sourceAccountId = sourceId;
  }

  get sourceAccount(): string { return this.sourceAccountId; }

  execute(): void {
    // Lógica futura específica para retiros
    this.markAsCompleted();
  }
}

export class Transfer extends Transaction {
  private sourceAccountId: string;
  private destinationAccountId: string;

  constructor(props: TransactionProps, sourceId: string, destId: string) {
    super(props);
    // Invariante de fraude básico
    if (sourceId === destId) {
        throw new SameAccountTransferError(sourceId);
    }
    this.sourceAccountId = sourceId;
    this.destinationAccountId = destId;
  }

  get sourceAccount(): string { return this.sourceAccountId; }
  get destinationAccount(): string { return this.destinationAccountId; }

  execute(): void {
    /*
       Nota Arquitectónica: La operación atómica real (restar de A y sumar a B en la Base de Datos)
       NO ocurre aquí. Esta entidad solo representa el estado del movimiento.
       El Caso de Uso (TransferMoneyUseCase) coordinará a la clase Account y a la Infraestructura.
    */
    this.markAsCompleted();
  }
}