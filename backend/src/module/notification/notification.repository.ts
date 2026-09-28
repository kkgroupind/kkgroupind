import { Injectable } from '@nestjs/common';
import { PrismaService, NotificationType, Role } from '../../database';
import { QueryNotificationDto } from './dto/query-notification.dto';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
    metadata?: any;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || NotificationType.INFO,
        link: data.link,
        metadata: data.metadata,
      },
    });
  }

  async createMany(
    items: Array<{
      userId: string;
      title: string;
      message: string;
      type?: NotificationType;
      link?: string;
      metadata?: any;
    }>,
  ) {
    if (!items.length) return [];
    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.notification.create({
          data: {
            userId: item.userId,
            title: item.title,
            message: item.message,
            type: item.type || NotificationType.INFO,
            link: item.link,
            metadata: item.metadata,
          },
        }),
      ),
    );
  }

  async findForUser(userId: string, params: QueryNotificationDto) {
    const { unreadOnly, type, page = 1, limit = 20 } = params;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { userId };

    if (unreadOnly) {
      where.isRead = false;
    }

    if (type) {
      where.type = type;
    }

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return { items, total, unreadCount };
  }

  async findById(id: string) {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { id, userId },
    });
  }

  async findStaffAndAdminUserIds(): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      where: {
        role: { in: [Role.SUPER_ADMIN, Role.OFFICE_STAFF] },
        isActive: true,
      },
      select: { id: true },
    });
    return users.map((u) => u.id);
  }

  async findUserIdsByRole(role: Role): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      where: { role, isActive: true },
      select: { id: true },
    });
    return users.map((u) => u.id);
  }
}
