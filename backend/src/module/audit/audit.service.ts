import { Injectable } from '@nestjs/common';
import { AuditRepository } from './audit.repository';
import { QueryAuditDto } from './dto/query-audit.dto';
import { Role } from '../../database';
import { AUDIT_MESSAGES } from '../../common';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepo: AuditRepository) {}

  async recordLog(data: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    userRole?: Role;
    action: string;
    entityType: string;
    entityId?: string;
    details?: string | Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
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

  async getLogs(params: QueryAuditDto) {
    const { items, total } = await this.auditRepo.findFiltered(params);
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
