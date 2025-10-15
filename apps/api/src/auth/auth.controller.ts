import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ValidateResponse } from '../common/response-validation.decorator';
import {
  LoginSchema,
  RegisterSchema,
  RegisterResponseSchema,
  LoginResponseSchema,
  LogoutResponseSchema,
  ProfileResponseSchema,
} from '@workspace/api';
import { Public } from '../common/public.decorator';
import type {
  LoginInput,
  RegisterInput,
  RegisterResponse,
  LoginResponse,
  LogoutResponse,
  ProfileResponse,
} from '@workspace/api';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

interface GoogleAuthRequest extends Request {
  user?: import('@prisma/client').User;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return { msg: 'Redirecting to Google...' };
  }

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: GoogleAuthRequest,
    @Res() res: Response
  ) {
    const result = await this.authService.generateToken(req.user!);
    res.cookie('teamops_token', result.access_token, {
      httpOnly: true,
      sameSite: process.env.APP_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.APP_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      domain: process.env.APP_ENV === 'production' ? undefined : undefined,
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }

  @Get('profile')
  @ValidateResponse(ProfileResponseSchema)
  async getProfile(@Req() req: AuthenticatedRequest): Promise<ProfileResponse> {
    console.log('Profile request - user:', req.user);
    console.log('Profile request - headers:', {
      authorization: req.headers.authorization,
      cookie: req.headers.cookie,
    });

    if (!req.user || !req.user.userId) {
      console.error('Profile request failed - user not authenticated:', {
        hasUser: !!req.user,
        userId: req.user?.userId,
      });
      throw new Error('User not authenticated');
    }

    const user = await this.authService['prisma'].user.findUnique({
      where: { id: req.user.userId },
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

    if (!user) {
      console.error('Profile request failed - user not found:', {
        userId: req.user.userId,
      });
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || 'Unknown User',
      role: user.role,
      provider: user.provider,
      providerId: user.providerId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  @Post('register')
  @Public()
  @ValidateResponse(RegisterResponseSchema)
  async register(
    @Body(new ZodValidationPipe(RegisterSchema)) body: RegisterInput,
    @Res({ passthrough: true }) res: Response
  ): Promise<RegisterResponse> {
    const result = await this.authService.register(
      body.email,
      body.password,
      body.name
    );
    res.cookie('teamops_token', result.access_token, {
      httpOnly: true,
      sameSite: process.env.APP_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.APP_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return result;
  }

  @Post('login')
  @Public()
  @ValidateResponse(LoginResponseSchema)
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) body: LoginInput,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponse> {
    console.log('Login attempt for email:', body.email);
    const result = await this.authService.login(body.email, body.password);
    
    const isProduction = process.env.APP_ENV === 'production';
    console.log('Login successful - setting cookie with config:', {
      isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      hasToken: !!result.access_token,
      tokenLength: result.access_token?.length,
      APP_ENV: process.env.APP_ENV,
      NODE_ENV: process.env.NODE_ENV,
    });

    res.cookie('teamops_token', result.access_token, {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    
    console.log('Cookie set, returning response with token in body');
    return result;
  }

  @Post('logout')
  @ValidateResponse(LogoutResponseSchema)
  async logout(
    @Res({ passthrough: true }) res: Response
  ): Promise<LogoutResponse> {
    res.clearCookie('teamops_token');
    return { ok: true };
  }
}
