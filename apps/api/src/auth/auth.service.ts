import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../infrastructure/prisma.service';
import * as bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';
import type { Role, RegisterResponse } from '@workspace/api';

interface GoogleProfile {
  id: string;
  emails?: Array<{ value: string }>;
  displayName?: string;
}

interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService
  ) {}

  async validateGoogleUser(profile: GoogleProfile): Promise<User> {
    const { id, emails, displayName } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      throw new Error('No email found in Google profile');
    }

    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: displayName || null,
          provider: 'google',
          providerId: id,
        },
      });
    }
    return user;
  }

  async generateToken(
    user: User
  ): Promise<{ access_token: string; user: RegisterResponse }> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const access_token = this.jwt.sign(payload);
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
      },
    };
  }

  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<{ access_token: string; user: RegisterResponse }> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    
    if (existing) {
      if (existing.passwordHash) {
        throw new ConflictException('USER_EXISTS_LOGIN');
      }
      throw new ConflictException('USER_EXISTS_GOOGLE');
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        name: name || null,
      },
    });

    return this.signToken(user.id, user.email, user.role);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('EMAIL_NOT_FOUND');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException('USE_GOOGLE_LOGIN');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('INVALID_PASSWORD');
    }
    return user;
  }

  async login(
    email: string,
    password: string
  ): Promise<{ access_token: string; user: RegisterResponse }> {
    const user = await this.validateUser(email, password);
    return this.signToken(user.id, user.email, user.role);
  }

  private signToken(
    userId: string,
    email: string,
    role: Role
  ): { access_token: string; user: RegisterResponse } {
    const payload: TokenPayload = { sub: userId, email, role };
    const token = this.jwt.sign(payload);
    return {
      access_token: token,
      user: { id: userId, email, name: undefined },
    };
  }
}
