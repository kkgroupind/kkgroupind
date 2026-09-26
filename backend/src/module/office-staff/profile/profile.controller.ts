import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, Roles } from '../../../common';
import { Role } from '../../../database';
import { ProfileService } from './profile.service';
import { UpdateOfficeStaffProfileDto } from './dto';

@Controller('office-staff/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Roles(Role.OFFICE_STAFF, Role.SUPER_ADMIN)
  @Get()
  async getProfile(@CurrentUser('id') staffId: string) {
    return this.profileService.getProfile(staffId);
  }

  @Roles(Role.OFFICE_STAFF, Role.SUPER_ADMIN)
  @Patch()
  async updateProfile(
    @CurrentUser('id') staffId: string,
    @Body() dto: UpdateOfficeStaffProfileDto,
  ) {
    return this.profileService.updateProfile(staffId, dto);
  }

  @Roles(Role.OFFICE_STAFF, Role.SUPER_ADMIN)
  @Get('check-username')
  async checkUsername(
    @Query('username') username: string,
    @CurrentUser('id') staffId: string,
  ) {
    return this.profileService.checkUsernameAvailability(username, staffId);
  }

  @Roles(Role.OFFICE_STAFF, Role.SUPER_ADMIN)
  @Get('cloudinary-config')
  async getCloudinaryConfig() {
    return this.profileService.getCloudinaryConfig();
  }

  @Roles(Role.OFFICE_STAFF, Role.SUPER_ADMIN)
  @Post('avatar')
  async uploadAvatar(
    @CurrentUser('id') staffId: string,
    @Body('image') image: string,
  ) {
    return this.profileService.uploadAvatar(staffId, image);
  }
}
