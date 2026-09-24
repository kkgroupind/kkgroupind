import { request } from './api-client';
import {
  AttendanceOverviewResponse,
  StaffStatus,
  TodayAttendanceResponse,
  WorkerStatus,
} from './types';

export const AttendanceService = {
  /**
   * Fetch current user's today attendance & availability record
   */
  async getTodayAttendance(token: string): Promise<TodayAttendanceResponse> {
    return request<TodayAttendanceResponse>('/attendance/today', {
      method: 'GET',
    }, token);
  },

  /**
   * Update attendance / availability duty status
   */
  async updateStatus(
    status: 'AVAILABLE' | 'OFF_DUTY',
    token: string,
    notes?: string,
  ): Promise<{
    message: string;
    isAvailable: boolean;
    date: string;
    staffStatus?: StaffStatus;
    workerStatus?: WorkerStatus;
    attendance: any;
  }> {
    return request('/attendance/status', {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    }, token);
  },

  /**
   * Super Admin & Office Staff: Get company-wide attendance overview
   */
  async getOverview(token: string): Promise<AttendanceOverviewResponse> {
    return request<AttendanceOverviewResponse>('/attendance/overview', {
      method: 'GET',
    }, token);
  },
};
