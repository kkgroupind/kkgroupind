import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { CurrentUser, Roles, JwtAuthGuard, RolesGuard } from '../../common';
import { Role } from '../../database';

@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@CurrentUser('id') userId: string, @Body() createAnnouncementDto: CreateAnnouncementDto) {
    return this.announcementService.create(userId, createAnnouncementDto);
  }

  @Get('admin')
  @Roles(Role.SUPER_ADMIN)
  findAllForAdmin() {
    return this.announcementService.findAllForAdmin();
  }

  @Get()
  findAllForUser(@CurrentUser('role') role: Role) {
    return this.announcementService.findAllForUser(role);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.announcementService.remove(id, userId);
  }
}
