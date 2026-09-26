import { request } from '../../api-client';

export interface ServiceItem {
  id: string;
  serviceId: string;
  name: string;
  slug: string;
  category?: string | null;
  description: string;
  features: string[];
  icon?: string | null;
  image?: string | null;
  priceRange?: string | null;
  duration?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceInput {
  name: string;
  serviceId?: string;
  slug?: string;
  category?: string;
  description: string;
  features?: string[];
  icon?: string;
  image?: string;
  priceRange?: string;
  duration?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateServiceInput {
  name?: string;
  serviceId?: string;
  slug?: string;
  category?: string;
  description?: string;
  features?: string[];
  icon?: string;
  image?: string;
  priceRange?: string;
  duration?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ListServicesParams {
  search?: string;
  category?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ListServicesResponse {
  data: ServiceItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const adminServicesService = {
  listServices: (token: string, params?: ListServicesParams) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (typeof params?.isActive === 'boolean') {
      query.append('isActive', params.isActive.toString());
    }
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<ListServicesResponse>(
      `/admin/services${qs}`,
      { method: 'GET' },
      token,
    );
  },

  getServiceById: (id: string, token: string) =>
    request<ServiceItem>(`/admin/services/${id}`, { method: 'GET' }, token),

  createService: (data: CreateServiceInput, token: string) =>
    request<{ message: string; service: ServiceItem }>(
      '/admin/services',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token,
    ),

  updateService: (id: string, data: UpdateServiceInput, token: string) =>
    request<{ message: string; service: ServiceItem }>(
      `/admin/services/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      token,
    ),

  toggleServiceStatus: (id: string, token: string) =>
    request<{ message: string; service: ServiceItem }>(
      `/admin/services/${id}/toggle-status`,
      { method: 'PATCH' },
      token,
    ),

  deleteService: (id: string, token: string) =>
    request<{ message: string }>(
      `/admin/services/${id}`,
      { method: 'DELETE' },
      token,
    ),

  seedServices: (token: string) =>
    request<{ message: string; count: number; services: ServiceItem[] }>(
      '/admin/services/seed',
      { method: 'POST' },
      token,
    ),
};
