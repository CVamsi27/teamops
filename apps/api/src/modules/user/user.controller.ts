import { Controller, Get, Put, Body, Param, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ValidateResponse } from '../../common/response-validation.decorator';
import {
  UpdateUserSchema,
  PublicUserSchema,
  type UpdateUser,
  type PublicUser,
} from '@workspace/api';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @ValidateResponse(PublicUserSchema)
  async getMyProfile(@Req() req: AuthenticatedRequest): Promise<PublicUser> {
    return this.userService.getProfile(req.user!.userId);
  }

  @Put('me')
  @ValidateResponse(PublicUserSchema)
  async updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(UpdateUserSchema)) data: UpdateUser
  ): Promise<PublicUser> {
    return this.userService.updateProfile(req.user!.userId, data);
  }

  @Get(':id')
  @ValidateResponse(PublicUserSchema)
  async getUserById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest
  ): Promise<PublicUser> {
    return this.userService.getUserById(id, req.user!.userId);
  }
}
