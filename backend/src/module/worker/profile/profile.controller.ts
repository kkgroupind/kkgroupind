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
import { UpdateWorkerProfileDto } from './dto';

@Controller('worker/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Roles(Role.WORKER, Role.SUPER_ADMIN)
  @Get()
  async getProfile(@CurrentUser('id') workerId: string) {
    return this.profileService.getProfile(workerId);
  }

  @Roles(Role.WORKER, Role.SUPER_ADMIN)
  @Patch()
  async updateProfile(
    @CurrentUser('id') workerId: string,
    @Body() dto: UpdateWorkerProfileDto,
  ) {
    return this.profileService.updateProfile(workerId, dto);
  }

  @Roles(Role.WORKER, Role.SUPER_ADMIN)
  @Get('check-username')
  async checkUsername(
    @Query('username') username: string,
    @CurrentUser('id') workerId: string,
  ) {
    return this.profileService.checkUsernameAvailability(username, workerId);
  }

  @Roles(Role.WORKER, Role.SUPER_ADMIN)
  @Get('cloudinary-config')
  async getCloudinaryConfig() {
    return this.profileService.getCloudinaryConfig();
  }

  @Roles(Role.WORKER, Role.SUPER_ADMIN)
  @Post('avatar')
  async uploadAvatar(
    @CurrentUser('id') workerId: string,
    @Body('image') image: string,
  ) {
    return this.profileService.uploadAvatar(workerId, image);
  }
}
