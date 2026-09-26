import { request } from '../../api-client';
import type { User } from '../../types';

export interface CreatePersonData {
  name: string;
  mobileNumber: string;
  username: string;
  password: string;
  role: 'WORKER' | 'OFFICE_STAFF' | 'CUSTOMER';
  email?: string;
  avatar?: string | null;
}

export interface UpdatePersonData {
  name?: string;
  mobileNumber?: string;
  username?: string;
  password?: string;
  role?: 'WORKER' | 'OFFICE_STAFF' | 'CUSTOMER';
  email?: string;
  avatar?: string | null;
  isActive?: boolean;
  workerStatus?: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
  staffStatus?: 'AVAILABLE' | 'OFF_DUTY';
}

export interface ListPeopleParams {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListPeopleResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UsernameAvailabilityResponse {
  isAvailable: boolean;
  username: string;
  suggestions: string[];
}

export interface EmailAvailabilityResponse {
  isAvailable: boolean;
  email: string;
}

export const peopleService = {
  createPerson: (data: CreatePersonData, token: string) =>
    request<{ message: string; person: User; staff: User }>('/admin/people', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  listPeople: (token: string, params?: ListPeopleParams) => {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<ListPeopleResponse>(
      `/admin/people${qs}`,
      { method: 'GET' },
      token,
    );
  },

  getPersonByUsername: (username: string, token: string) =>
    request<User>(`/admin/people/${username}`, {
      method: 'GET',
    }, token),

  checkUsername: (username: string, token: string) =>
    request<UsernameAvailabilityResponse>(
      `/admin/people/check-username?username=${encodeURIComponent(username)}`,
      { method: 'GET' },
      token,
    ),

  checkEmail: (email: string, token: string) =>
    request<EmailAvailabilityResponse>(
      `/admin/people/check-email?email=${encodeURIComponent(email)}`,
      { method: 'GET' },
      token,
    ),

  updatePerson: (id: string, data: UpdatePersonData, token: string) =>
    request<{ message: string; person: User }>(`/admin/people/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token),

  deletePerson: (id: string, token: string) =>
    request<{ message: string }>(`/admin/people/${id}`, {
      method: 'DELETE',
    }, token),

  // Backward compatibility aliases
  createStaff: (data: CreatePersonData, token: string) =>
    peopleService.createPerson(data, token),

  listStaff: (token: string, params?: ListPeopleParams) =>
    peopleService.listPeople(token, params),

  getStaffByUsername: (username: string, token: string) =>
    peopleService.getPersonByUsername(username, token),

  deleteStaff: (id: string, token: string) =>
    peopleService.deletePerson(id, token),
};

// Also export alias for backward compatibility
export const staffService = peopleService;
