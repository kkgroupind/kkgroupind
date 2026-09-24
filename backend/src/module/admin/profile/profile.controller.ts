import {
  Body,
  Controller,
  Get,
  Patch,
} from '@nestjs/common';
import { CurrentUser, Roles } from '../../../common';
import { Role } from '../../../database';
import { ProfileService } from './profile.service';
import { UpdateAdminProfileDto } from './dto';

@Controller('admin/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Roles(Role.SUPER_ADMIN)
  @Get()
  async getProfile(@CurrentUser('id') adminId: string) {
    return this.profileService.getProfile(adminId);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch()
  async updateProfile(
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateAdminProfileDto,
  ) {
    return this.profileService.updateProfile(adminId, dto);
  }
}
