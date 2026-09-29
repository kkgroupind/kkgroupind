import { request } from './api-client';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target: 'ALL' | 'WORKERS' | 'CUSTOMERS' | 'OFFICE_STAFF';
  priority: 'High' | 'Normal' | 'Low';
  isPublished: boolean;
  createdAt: string;
  creator?: {
    name: string | null;
    username: string;
    role?: string;
  };
}

export const announcementService = {
  create: (token: string, data: Partial<Announcement>) =>
    request<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  getAllForAdmin: (token: string) =>
    request<Announcement[]>('/announcements/admin', { method: 'GET' }, token),

  getAllForUser: (token: string) =>
    request<Announcement[]>('/announcements', { method: 'GET' }, token),

  delete: (token: string, id: string) =>
    request<{ message: string }>(`/announcements/${id}`, { method: 'DELETE' }, token),
};
