import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { InvalidPropValueError } from '../domain/exceptions/DomainError.js';
import { InvalidCredentialsError } from '../domain/exceptions/UserError.js';
import type { UserRepository } from '../domain/repositories/Repositories.js';
import type { LoginInputDTO, LoginOutputDTO } from './dto/AuthDTOs.js';

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSecret = process.env.JWT_SECRET ?? 'development-secret',
  ) {}

  async execute(input: LoginInputDTO): Promise<LoginOutputDTO> {
    if (!input.email || !input.password) {
      throw new InvalidPropValueError('El correo y la contraseña son obligatorios.');
    }

    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      this.jwtSecret,
      { expiresIn: '1h' },
    );

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
