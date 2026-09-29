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

  async countWorkersByStatus() {
    return this.prisma.user.groupBy({
      by: ['workerStatus'],
      where: {
        role: Role.WORKER,
      },
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

  async getRecentActivities(limit: number, page: number, role?: string) {
    const whereClause: any = {};
    if (role && role !== 'ALL') {
      whereClause.userRole = role;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where: whereClause,
        take: limit,
        skip,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where: whereClause }),
    ]);

    return {
      data: logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
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

  async getEnquiriesInDateRange(startDate: Date, endDate: Date) {
    return this.prisma.serviceEnquiry.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: 'asc',
      }
    });
  }
}
