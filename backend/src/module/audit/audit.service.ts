import { Injectable } from '@nestjs/common';
import { AuditRepository } from './audit.repository';
import { QueryAuditDto } from './dto/query-audit.dto';
import { Role } from '../../database';
import { AUDIT_MESSAGES } from '../../common';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepo: AuditRepository) {}

  async recordLog(data: {
    userId?: string | null;
    userName?: string | null;
    userEmail?: string | null;
    userRole?: Role | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    details?: string | Record<string, any> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    try {
      const detailsStr =
        typeof data.details === 'object'
          ? JSON.stringify(data.details)
          : data.details;

      return await this.auditRepo.create({
        ...data,
        details: detailsStr,
      });
    } catch {
      // Non-blocking: audit log failure should not abort critical user transactions
      return null;
    }
  }

  async getLogs(user: { id: string; role: Role }, params: QueryAuditDto) {
    const isSuperAdmin = user.role === Role.SUPER_ADMIN;
    const effectiveParams: QueryAuditDto = { ...params };

    // Strict security rule: Non-admin users are strictly restricted to their own userId
    if (!isSuperAdmin) {
      effectiveParams.userId = user.id;
      delete effectiveParams.userRole;
    }

    const { items, total } = await this.auditRepo.findFiltered(effectiveParams);
    const limit = Number(params.limit || 25);
    const page = Number(params.page || 1);

    return {
      message: AUDIT_MESSAGES.LOGS_FETCHED_SUCCESS,
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getMyLogs(userId: string, params: QueryAuditDto) {
    const effectiveParams: QueryAuditDto = { ...params, userId };
    delete effectiveParams.userRole;

    const { items, total } = await this.auditRepo.findFiltered(effectiveParams);
    const limit = Number(params.limit || 25);
    const page = Number(params.page || 1);

    return {
      message: AUDIT_MESSAGES.LOGS_FETCHED_SUCCESS,
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getStats() {
    const stats = await this.auditRepo.getStats();
    return {
      message: AUDIT_MESSAGES.STATS_FETCHED_SUCCESS,
      ...stats,
    };
  }
}
