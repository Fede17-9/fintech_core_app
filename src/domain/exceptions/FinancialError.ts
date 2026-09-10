import { DomainError } from './DomainError.js';

export class InsufficientBalanceError extends DomainError {
  constructor(accountId: string) {
    super(`Operación denegada: Saldo insuficiente en la cuenta [${accountId}].`);
  }
}

export class AccountFrozenError extends DomainError {
  constructor(accountId: string) {
    super(`Alerta de seguridad: La cuenta [${accountId}] se encuentra congelada.`);
  }
}

export class InvalidAmountError extends DomainError {
  constructor(message: string) {
    super(`Validación monetaria fallida: ${message}`);
  }
}

export class SameAccountTransferError extends DomainError {
  constructor(accountId: string) {
    super(`Alerta de Operación: No se permiten transferencias hacia la misma cuenta de origen [${accountId}].`);
  }
}