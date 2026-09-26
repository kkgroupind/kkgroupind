import { request } from './api-client';

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface AuditQueryParams {
  userId?: string;
  userRole?: string;
  entityType?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditStats {
  totalToday: number;
  totalAllTime: number;
  recentLogs: AuditLogItem[];
}

export const AuditService = {
  async getLogs(
    token?: string | null,
    params: AuditQueryParams = {},
  ): Promise<{
    items: AuditLogItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.set(key, String(val));
      }
    });

    const queryString = query.toString();
    const endpoint = `/audit/logs${queryString ? `?${queryString}` : ''}`;
    return request<{
      items: AuditLogItem[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(endpoint, { method: 'GET' }, token);
  },

  async getStats(token?: string | null): Promise<AuditStats> {
    return request<AuditStats>('/audit/stats', { method: 'GET' }, token);
  },
};
