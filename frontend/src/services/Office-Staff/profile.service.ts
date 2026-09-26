import { request } from '../api-client';
import type { User } from '../types';

export interface UpdateOfficeStaffProfileData {
  name?: string;
  username?: string;
  mobileNumber?: string;
  email?: string;
  avatar?: string;
  staffStatus?: 'AVAILABLE' | 'OFF_DUTY';
  currentPassword?: string;
  newPassword?: string;
}

export interface CheckUsernameResponse {
  isAvailable: boolean;
  username: string;
}

export interface CloudinaryConfigResponse {
  cloudName: string;
  uploadPreset: string;
}

export const officeStaffProfileService = {
  getProfile: (token: string) =>
    request<{ message: string; user: User }>('/office-staff/profile', {
      method: 'GET',
    }, token),

  updateProfile: (data: UpdateOfficeStaffProfileData, token: string) =>
    request<{ message: string; user: User }>('/office-staff/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token),

  checkUsername: (username: string, token: string) =>
    request<CheckUsernameResponse>(
      `/office-staff/profile/check-username?username=${encodeURIComponent(username)}`,
      { method: 'GET' },
      token,
    ),

  getCloudinaryConfig: (token: string) =>
    request<CloudinaryConfigResponse>(
      '/office-staff/profile/cloudinary-config',
      { method: 'GET' },
      token,
    ),

  uploadAvatar: (image: string, token: string) =>
    request<{ message: string; avatar: string; user: User }>(
      '/office-staff/profile/avatar',
      {
        method: 'POST',
        body: JSON.stringify({ image }),
      },
      token,
    ),

  /**
   * Upload image directly to Cloudinary using an unsigned upload preset
   */
  uploadToCloudinaryDirect: async (
    fileOrBlob: Blob | File,
    cloudName: string,
    uploadPreset: string,
  ): Promise<{ secure_url: string; public_id: string }> => {
    const formData = new FormData();
    formData.append('file', fileOrBlob);
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || 'Cloudinary upload failed');
    }

    return res.json();
  },
};
