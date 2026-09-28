import { request } from './api-client';

export type NotificationType =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'URGENT'
  | 'ENQUIRY'
  | 'ASSIGNMENT'
  | 'DUTY'
  | 'FINANCE'
  | 'SYSTEM';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueryParams {
  unreadOnly?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

export const NotificationService = {
  async getMyNotifications(
    token?: string | null,
    params: NotificationQueryParams = {},
  ): Promise<{
    items: NotificationItem[];
    unreadCount: number;
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.set(key, String(val));
      }
    });

    const queryString = query.toString();
    const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`;
    return request<{
      items: NotificationItem[];
      unreadCount: number;
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(endpoint, { method: 'GET' }, token);
  },

  async markAsRead(
    id: string,
    token?: string | null,
  ): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/notifications/${id}/read`,
      { method: 'PATCH' },
      token,
    );
  },

  async markAllAsRead(token?: string | null): Promise<{ message: string }> {
    return request<{ message: string }>(
      '/notifications/read-all',
      { method: 'PATCH' },
      token,
    );
  },

  async deleteNotification(
    id: string,
    token?: string | null,
  ): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/notifications/${id}`,
      { method: 'DELETE' },
      token,
    );
  },

  async adminBroadcast(
    token: string | null,
    dto: { role?: string; title: string; message: string; link?: string },
  ): Promise<any> {
    return request(
      '/notifications/admin-broadcast',
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
      token,
    );
  },
};
