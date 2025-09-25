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
import express from 'express';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { LoginSchema, RegisterSchema } from '@workspace/api';
import { Public } from '../common/public.decorator';
import type {
  LoginInput,
  RegisterInput,
  LoginResponse,
  RegisterResponse,
} from '@workspace/api';

interface AuthenticatedRequest extends express.Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

interface GoogleAuthRequest extends express.Request {
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
    @Res() res: express.Response
  ) {
    const { access_token, user } = await this.authService.generateToken(
      req.user!
    );
    res.cookie('teamops_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.APP_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }

  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  @Post('register')
  @Public()
  async register(
    @Body(new ZodValidationPipe(RegisterSchema)) body: RegisterInput,
    @Res({ passthrough: true }) res: express.Response
  ): Promise<RegisterResponse & { access_token: string }> {
    const { access_token, user } = await this.authService.register(
      body.email,
      body.password,
      body.name
    );
    res.cookie('teamops_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.APP_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return { access_token, ...user };
  }

  @Post('login')
  @Public()
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) body: LoginInput,
    @Res({ passthrough: true }) res: express.Response
  ): Promise<LoginResponse & { user: RegisterResponse }> {
    const { access_token, user } = await this.authService.login(
      body.email,
      body.password
    );
    res.cookie('teamops_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.APP_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return { access_token, user };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: express.Response) {
    res.clearCookie('teamops_token');
    return { ok: true };
  }
}
