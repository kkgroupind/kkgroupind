import { request } from '../api-client';
import type { User } from '../types';

export interface UpdateWorkerProfileData {
  name?: string;
  username?: string;
  mobileNumber?: string;
  email?: string;
  avatar?: string;
  workerStatus?: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
  currentPassword?: string;
  newPassword?: string;
}

export interface WorkerCheckUsernameResponse {
  isAvailable: boolean;
  username: string;
}

export interface WorkerCloudinaryConfigResponse {
  cloudName: string;
  uploadPreset: string;
}

export const workerProfileService = {
  getProfile: (token: string) =>
    request<{ message: string; user: User }>('/worker/profile', {
      method: 'GET',
    }, token),

  updateProfile: (data: UpdateWorkerProfileData, token: string) =>
    request<{ message: string; user: User }>('/worker/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token),

  checkUsername: (username: string, token: string) =>
    request<WorkerCheckUsernameResponse>(
      `/worker/profile/check-username?username=${encodeURIComponent(username)}`,
      { method: 'GET' },
      token,
    ),

  getCloudinaryConfig: (token: string) =>
    request<WorkerCloudinaryConfigResponse>(
      '/worker/profile/cloudinary-config',
      { method: 'GET' },
      token,
    ),

  uploadAvatar: (image: string, token: string) =>
    request<{ message: string; avatar: string; user: User }>(
      '/worker/profile/avatar',
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
      throw new Error(errData?.error?.message || 'Cloudinary direct upload failed');
    }

    return res.json();
  },
};
