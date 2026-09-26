import { Injectable } from '@nestjs/common';
import { PrismaService, Role } from '../../database';
import { QueryAuditDto } from './dto/query-audit.dto';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    userRole?: Role;
    action: string;
    entityType: string;
    entityId?: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        userRole: data.userRole,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async findFiltered(params: QueryAuditDto) {
    const { userId, userRole, entityType, action, startDate, endDate, search, page = 1, limit = 25 } = params;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (userRole) {
      where.userRole = userRole;
    }

    if (entityType) {
      where.entityType = { equals: entityType, mode: 'insensitive' };
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { userName: { contains: q, mode: 'insensitive' } },
        { userEmail: { contains: q, mode: 'insensitive' } },
        { action: { contains: q, mode: 'insensitive' } },
        { details: { contains: q, mode: 'insensitive' } },
        { entityId: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalToday, totalAllTime, recentLogs] = await Promise.all([
      this.prisma.auditLog.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      totalToday,
      totalAllTime,
      recentLogs,
    };
  }
}
