import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { type UpdateUser, type User, type PublicUser, type Role } from '@workspace/api';

type PrismaUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  provider: string | null;
  providerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  private transformUser(user: PrismaUser): User {
    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private transformPublicUser(user: PrismaUser): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      provider: user.provider,
      providerId: user.providerId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? this.transformUser(user as unknown as PrismaUser) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? this.transformUser(user as unknown as PrismaUser) : null;
  }

  async update(id: string, data: UpdateUser): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this.transformUser(user as unknown as PrismaUser);
  }

  async findPublicById(id: string): Promise<PublicUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        provider: true,
        providerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user ? this.transformPublicUser(user as unknown as PrismaUser) : null;
  }

  async findManyPublic(ids: string[]): Promise<PublicUser[]> {
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        provider: true,
        providerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users.map((user) => this.transformPublicUser(user as unknown as PrismaUser));
  }
}
