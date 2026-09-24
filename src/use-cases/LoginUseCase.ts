import { InvalidPropValueError } from '../domain/exceptions/DomainError.js';
import { InvalidCredentialsError } from '../domain/exceptions/UserError.js';
import type { UserRepository } from '../domain/repositories/Repositories.js';
import type { PasswordHasher } from '../domain/services/PasswordHasher.js';
import type { TokenService } from '../domain/services/TokenService.js';
import type { LoginInputDTO, LoginOutputDTO } from './dto/AuthDTOs.js';

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: LoginInputDTO): Promise<LoginOutputDTO> {
    if (!input.email || !input.password) {
      throw new InvalidPropValueError('El correo y la contraseña son obligatorios.');
    }

    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !(await this.passwordHasher.compare(input.password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }

    const token = this.tokenService.generate({ sub: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
    };
  }
}
