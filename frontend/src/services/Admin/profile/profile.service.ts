import { request } from '../../api-client';
import type { User } from '../../types';

export interface UpdateAdminProfileData {
  name?: string;
  username?: string;
  mobileNumber?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const adminProfileService = {
  getProfile: (token: string) =>
    request<{ message: string; user: User }>('/admin/profile', {
      method: 'GET',
    }, token),

  updateProfile: (data: UpdateAdminProfileData, token: string) =>
    request<{ message: string; user: User }>('/admin/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token),
};
