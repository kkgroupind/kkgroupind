import {
  Controller,
  Get,
  Patch,
  Body,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Role } from '../../database';
import { CurrentUser, Public, RATE_LIMITS, Roles } from '../../common';

@Throttle({ default: RATE_LIMITS.SETTINGS })
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get('public')
  async getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('admin')
  async getAdminSettings() {
    return this.settingsService.getAdminSettings();
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch('admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateSettings(
    @Body() dto: UpdateSettingsDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      undefined;
    const userAgent = req.headers['user-agent'] || undefined;

    return this.settingsService.updateSettings(dto, user, ipAddress, userAgent);
  }
}
