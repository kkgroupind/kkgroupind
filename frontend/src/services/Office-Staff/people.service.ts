import { request } from '../api-client';
import type { User } from '../types';

export interface OfficeStaffCreatePersonData {
  name: string;
  mobileNumber: string;
  username: string;
  password: string;
  role: 'WORKER' | 'CUSTOMER';
  email?: string;
}

export interface OfficeStaffUpdatePersonData {
  name?: string;
  mobileNumber?: string;
  username?: string;
  password?: string;
  role?: 'WORKER' | 'CUSTOMER';
  email?: string;
  isActive?: boolean;
  workerStatus?: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
}

export interface OfficeStaffListPeopleParams {
  role?: 'WORKER' | 'CUSTOMER';
  search?: string;
  page?: number;
  limit?: number;
}

export interface OfficeStaffListPeopleResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OfficeStaffUsernameAvailabilityResponse {
  isAvailable: boolean;
  username: string;
  suggestions: string[];
}

export interface OfficeStaffEmailAvailabilityResponse {
  isAvailable: boolean;
  email: string;
}

export const officeStaffPeopleService = {
  createPerson: (data: OfficeStaffCreatePersonData, token: string) =>
    request<{ message: string; person: User }>('/office-staff/people', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  listPeople: (token: string, params?: OfficeStaffListPeopleParams) => {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<OfficeStaffListPeopleResponse>(
      `/office-staff/people${qs}`,
      { method: 'GET' },
      token,
    );
  },

  getPersonByUsername: (username: string, token: string) =>
    request<User>(`/office-staff/people/${username}`, {
      method: 'GET',
    }, token),

  checkUsername: (username: string, token: string) =>
    request<OfficeStaffUsernameAvailabilityResponse>(
      `/office-staff/people/check-username?username=${encodeURIComponent(username)}`,
      { method: 'GET' },
      token,
    ),

  checkEmail: (email: string, token: string) =>
    request<OfficeStaffEmailAvailabilityResponse>(
      `/office-staff/people/check-email?email=${encodeURIComponent(email)}`,
      { method: 'GET' },
      token,
    ),

  updatePerson: (id: string, data: OfficeStaffUpdatePersonData, token: string) =>
    request<{ message: string; person: User }>(`/office-staff/people/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token),
};
