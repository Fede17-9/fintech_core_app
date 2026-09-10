/**
 * Clase abstracta raíz para todas las violaciones de reglas de negocio.
 * Garantiza que nuestra capa central permanezca agnóstica de los protocolos de transporte (HTTP/WebSockets).
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    // Establecemos el nombre de la clase hija instanciada dinámicamente
    this.name = this.constructor.name;
    // Limpiamos la traza de la pila para omitir el constructor actual, facilitando el debug en V8
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Clase que se usará para la validación de los campos al momento de crear una instancia.
 */
export class InvalidPropValueError extends DomainError {}