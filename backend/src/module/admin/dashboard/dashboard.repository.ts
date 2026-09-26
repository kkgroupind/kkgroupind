import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService, Role, User } from '../../../database';

export interface RecentUserEntity {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  phone: string | null;
  avatar: string | null;
  role: Role;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRegistrationPoint {
  id: string;
  role: Role;
  createdAt: Date;
}

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countTotalUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  async countUsersByRole() {
    return this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });
  }

  async countUsersByStatus() {
    return this.prisma.user.groupBy({
      by: ['isActive'],
      _count: {
        id: true,
      },
    });
  }

  async countUsersByEmailVerification() {
    return this.prisma.user.groupBy({
      by: ['isEmailVerified'],
      _count: {
        id: true,
      },
    });
  }

  async countUsersInDateRange(
    startDate: Date,
    endDate: Date,
    roles?: Role[],
  ): Promise<number> {
    const where: Prisma.UserWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      ...(roles && roles.length > 0 ? { role: { in: roles } } : {}),
    };

    return this.prisma.user.count({ where });
  }

  async getUsersSince(sinceDate: Date): Promise<UserRegistrationPoint[]> {
    return this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: sinceDate,
        },
      },
      select: {
        id: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getRecentUsers(limit: number): Promise<RecentUserEntity[]> {
    return this.prisma.user.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getOtpMetrics() {
    const [total, used] = await this.prisma.$transaction([
      this.prisma.otp.count(),
      this.prisma.otp.count({ where: { isUsed: true } }),
    ]);

    return {
      total,
      used,
      unused: total - used,
    };
  }
}
