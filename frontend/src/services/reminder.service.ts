import { request } from './api-client';

export type ReminderStatus =
  | 'UPCOMING'
  | 'DUE'
  | 'OVERDUE'
  | 'COMPLETED'
  | 'CANCELLED';

export type ReminderFrequency =
  | 'ONCE'
  | 'MONTHLY'
  | 'EVERY_2_MONTHS'
  | 'EVERY_3_MONTHS'
  | 'EVERY_6_MONTHS'
  | 'YEARLY'
  | 'CUSTOM_DAYS';

export interface ServiceReminder {
  id: string;
  title: string;
  serviceName: string;
  serviceId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  customerId?: string | null;
  customer?: {
    id: string;
    name?: string | null;
    username?: string | null;
    phone?: string | null;
    email?: string | null;
    role: string;
  } | null;
  frequency: ReminderFrequency;
  customIntervalDays?: number | null;
  dueDate: string;
  lastServicedDate?: string | null;
  completedDate?: string | null;
  status: ReminderStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderStats {
  total: number;
  upcoming: number;
  due: number;
  overdue: number;
  completed: number;
}

export interface ListRemindersQuery {
  search?: string;
  status?: ReminderStatus;
  frequency?: ReminderFrequency;
  serviceName?: string;
  dueFilter?: 'ALL' | 'OVERDUE' | 'DUE_TODAY' | 'THIS_WEEK' | 'THIS_MONTH';
  page?: number;
  limit?: number;
}

export interface CreateReminderInput {
  title?: string;
  serviceName: string;
  serviceId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  customerId?: string;
  frequency?: ReminderFrequency;
  customIntervalDays?: number;
  dueDate: string;
  lastServicedDate?: string;
  status?: ReminderStatus;
  notes?: string;
  feedCustomer?: boolean;
}

export interface UpdateReminderInput {
  title?: string;
  serviceName?: string;
  serviceId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerId?: string;
  frequency?: ReminderFrequency;
  customIntervalDays?: number;
  dueDate?: string;
  lastServicedDate?: string;
  status?: ReminderStatus;
  notes?: string;
  feedCustomer?: boolean;
}

export interface ListRemindersResponse {
  data: ServiceReminder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: ReminderStats;
}

export const reminderService = {
  async listReminders(
    token: string,
    query?: ListRemindersQuery,
  ): Promise<ListRemindersResponse> {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.status) params.append('status', query.status);
    if (query?.frequency) params.append('frequency', query.frequency);
    if (query?.serviceName) params.append('serviceName', query.serviceName);
    if (query?.dueFilter) params.append('dueFilter', query.dueFilter);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    const qs = params.toString();
    const endpoint = `/admin/reminders${qs ? `?${qs}` : ''}`;
    return request<ListRemindersResponse>(endpoint, { method: 'GET' }, token);
  },

  async getReminderById(token: string, id: string): Promise<ServiceReminder> {
    return request<ServiceReminder>(`/admin/reminders/${id}`, { method: 'GET' }, token);
  },

  async createReminder(
    token: string,
    data: CreateReminderInput,
  ): Promise<{ message: string; reminder: ServiceReminder }> {
    return request<{ message: string; reminder: ServiceReminder }>(
      '/admin/reminders',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token,
    );
  },

  async updateReminder(
    token: string,
    id: string,
    data: UpdateReminderInput,
  ): Promise<{ message: string; reminder: ServiceReminder }> {
    return request<{ message: string; reminder: ServiceReminder }>(
      `/admin/reminders/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      token,
    );
  },

  async completeCycle(
    token: string,
    id: string,
  ): Promise<{ message: string; reminder: ServiceReminder }> {
    return request<{ message: string; reminder: ServiceReminder }>(
      `/admin/reminders/${id}/complete-cycle`,
      {
        method: 'POST',
      },
      token,
    );
  },

  async deleteReminder(
    token: string,
    id: string,
  ): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/admin/reminders/${id}`,
      {
        method: 'DELETE',
      },
      token,
    );
  },

  async getStats(token: string): Promise<ReminderStats> {
    return request<ReminderStats>('/admin/reminders/stats/summary', { method: 'GET' }, token);
  },

  async listServiceConfigs(token: string): Promise<{ services: ServiceReminderConfig[] }> {
    return request<{ services: ServiceReminderConfig[] }>(
      '/admin/reminders/service-configs',
      { method: 'GET' },
      token,
    );
  },

  async updateServiceConfig(
    token: string,
    serviceId: string,
    data: UpdateServiceReminderConfigInput,
  ): Promise<{ message: string; service: any }> {
    return request<{ message: string; service: any }>(
      `/admin/reminders/service-configs/${serviceId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      token,
    );
  },
};

export interface ServiceReminderConfig {
  id: string;
  serviceId: string;
  name: string;
  slug: string;
  category: string;
  icon?: string | null;
  hasReminder: boolean;
  reminderFrequency: ReminderFrequency;
  reminderIntervalDays?: number | null;
  activeReminderCount: number;
}

export interface UpdateServiceReminderConfigInput {
  hasReminder?: boolean;
  reminderFrequency?: ReminderFrequency;
  reminderIntervalDays?: number | null;
}
