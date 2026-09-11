import type { User as PrismaUser, Prisma } from '../../generated/prisma/client.js';
import { User } from '../../domain/entities/User.js';

export class UserMapper {
  public static toDomain(prismaUser: PrismaUser): User {
    return User.create({
      id: prismaUser.id,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
      fullName: prismaUser.fullName,
      createdAt: prismaUser.createdAt,
    });
  }

  public static toPersistence(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      createdAt: user.createdAt,
    };
  }
}
