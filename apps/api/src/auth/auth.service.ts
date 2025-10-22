import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../infrastructure/prisma.service';
import * as bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';
import type { Role, RegisterResponse, LoginResponse } from '@workspace/api';

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
          name: displayName || 'Google User',
          provider: 'google',
          providerId: id,
        },
      });
    } else if (!user.name && displayName) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { name: displayName },
      });
    }
    
    return user;
  }

  async generateToken(user: User): Promise<RegisterResponse> {
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
        name: user.name,
      },
    };
  }

  async register(
    email: string,
    password: string,
    name: string
  ): Promise<RegisterResponse> {
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
        name,
        provider: 'local',
      },
    });

    return await this.signToken(user.id, user.email, user.role);
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

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.validateUser(email, password);
    return await this.signToken(user.id, user.email, user.role);
  }

  private async signToken(
    userId: string,
    email: string,
    role: Role
  ): Promise<RegisterResponse> {
    const payload: TokenPayload = { sub: userId, email, role };
    const token = this.jwt.sign(payload);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    return {
      access_token: token,
      user: { id: userId, email, name: user?.name || 'Unknown User' },
    };
  }
}
