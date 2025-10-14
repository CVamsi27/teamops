import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';
import { ValidateResponse } from '../../common/response-validation.decorator';
import { ActivityEventSchema } from '@workspace/api';
import { z } from 'zod';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ValidateResponse(z.array(ActivityEventSchema))
  async getActivities() {
    return this.activityService.getActivities();
  }

  @Get(':entityType/:entityId')
  @ValidateResponse(z.array(ActivityEventSchema))
  async getActivitiesByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string
  ) {
    return this.activityService.getActivitiesByEntity(entityType, entityId);
  }
}
