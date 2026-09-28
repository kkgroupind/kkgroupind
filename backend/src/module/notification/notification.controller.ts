import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Param,
  Query,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { NotificationService } from './notification.service';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Role } from '../../database';
import { CurrentUser, RATE_LIMITS, Roles } from '../../common';

@Throttle({ default: RATE_LIMITS.NOTIFICATION })
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF, Role.WORKER, Role.CUSTOMER)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getMyNotifications(
    @CurrentUser() user: any,
    @Query() query: QueryNotificationDto,
  ) {
    return this.notificationService.getUserNotifications(user?.id, query);
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF, Role.WORKER, Role.CUSTOMER)
  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationService.markAllAsRead(user?.id);
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF, Role.WORKER, Role.CUSTOMER)
  @Patch(':id/read')
  async markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationService.markAsRead(id, user?.id);
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF, Role.WORKER, Role.CUSTOMER)
  @Delete(':id')
  async deleteNotification(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationService.deleteNotification(id, user?.id);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post('admin-broadcast')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async adminBroadcast(
    @Body()
    dto: {
      role?: Role;
      title: string;
      message: string;
      link?: string;
    },
  ) {
    if (dto.role) {
      return this.notificationService.notifyRole(dto.role, {
        title: dto.title,
        message: dto.message,
        link: dto.link,
      });
    }
    return this.notificationService.notifyAdminsAndStaff({
      title: dto.title,
      message: dto.message,
      link: dto.link,
    });
  }
}
