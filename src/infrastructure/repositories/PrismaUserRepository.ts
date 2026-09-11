import type { PrismaClient } from '../../generated/prisma/client.js';
import type { UserRepository } from '../../domain/repositories/Repositories.js';
import { User } from '../../domain/entities/User.js';
import { UserMapper } from '../mappers/UserMapper.js';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        passwordHash: user.passwordHash,
        fullName: user.fullName,
      },
      create: UserMapper.toPersistence(user),
    });
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!prismaUser) return null;

    return UserMapper.toDomain(prismaUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!prismaUser) return null;

    return UserMapper.toDomain(prismaUser);
  }
}
