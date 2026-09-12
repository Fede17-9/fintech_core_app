import { DomainError } from './DomainError.js';

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`Ya existe un usuario registrado con el correo '${email}'.`);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('El correo o la contraseña son incorrectos.');
  }
}
