import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationType, Role } from '../../database';
import { NOTIFICATION_MESSAGES } from '../../common';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async notifyUser(data: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
    metadata?: any;
  }) {
    try {
      return await this.notificationRepo.create(data);
    } catch {
      // Non-blocking: notification dispatch failure must never abort primary business transaction
      return null;
    }
  }

  async notifyMultipleUsers(
    userIds: string[],
    notification: {
      title: string;
      message: string;
      type?: NotificationType;
      link?: string;
      metadata?: any;
    },
  ) {
    try {
      if (!userIds.length) return [];
      const items = userIds.map((userId) => ({
        userId,
        ...notification,
      }));
      return await this.notificationRepo.createMany(items);
    } catch {
      return [];
    }
  }

  async notifyAdminsAndStaff(notification: {
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
    metadata?: any;
  }) {
    try {
      const userIds = await this.notificationRepo.findStaffAndAdminUserIds();
      return await this.notifyMultipleUsers(userIds, notification);
    } catch {
      return [];
    }
  }

  async notifyRole(
    role: Role,
    notification: {
      title: string;
      message: string;
      type?: NotificationType;
      link?: string;
      metadata?: any;
    },
  ) {
    try {
      const userIds = await this.notificationRepo.findUserIdsByRole(role);
      return await this.notifyMultipleUsers(userIds, notification);
    } catch {
      return [];
    }
  }

  async getUserNotifications(userId: string, params: QueryNotificationDto) {
    const { items, total, unreadCount } = await this.notificationRepo.findForUser(
      userId,
      params,
    );
    const limit = Number(params.limit || 20);
    const page = Number(params.page || 1);

    return {
      message: NOTIFICATION_MESSAGES.NOTIFICATIONS_FETCHED_SUCCESS,
      items,
      unreadCount,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepo.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(NOTIFICATION_MESSAGES.NOTIFICATION_NOT_FOUND);
    }

    await this.notificationRepo.markAsRead(id, userId);
    return {
      message: NOTIFICATION_MESSAGES.NOTIFICATION_MARKED_READ,
    };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.markAllAsRead(userId);
    return {
      message: NOTIFICATION_MESSAGES.ALL_NOTIFICATIONS_MARKED_READ,
    };
  }

  async deleteNotification(id: string, userId: string) {
    await this.notificationRepo.delete(id, userId);
    return {
      message: NOTIFICATION_MESSAGES.NOTIFICATION_DELETED_SUCCESS,
    };
  }
}
