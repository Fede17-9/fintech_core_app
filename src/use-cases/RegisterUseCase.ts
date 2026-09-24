import { randomUUID } from 'node:crypto';
import { User } from '../domain/entities/User.js';
import { InvalidPropValueError } from '../domain/exceptions/DomainError.js';
import { UserAlreadyExistsError } from '../domain/exceptions/UserError.js';
import type { UserRepository } from '../domain/repositories/Repositories.js';
import type { PasswordHasher } from '../domain/services/PasswordHasher.js';
import type { RegisterInputDTO, UserOutputDTO } from './dto/AuthDTOs.js';

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterInputDTO): Promise<UserOutputDTO> {
    if (input.password.length < 8) {
      throw new InvalidPropValueError('La contraseña debe tener al menos 8 caracteres.');
    }

    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(input.email);
    }

    const user = User.create({
      id: randomUUID(),
      email: input.email,
      passwordHash: await this.passwordHasher.hash(input.password),
      fullName: input.fullName,
      createdAt: new Date(),
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
    };
  }
}
