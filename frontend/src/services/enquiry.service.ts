import { request } from './api-client';
import {
  ServiceEnquiry,
  WorkerWithAvailability,
  ServiceStatus,
  WorkerStatus,
} from './types';

export interface CreateEnquiryInput {
  serviceName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  state?: string;
  district?: string;
  city?: string;
  location?: string;
  mapUrl?: string;
  preferredDate?: string;
  deadline?: string;
  message: string;
}

export interface AssignWorkerInput {
  workerId: string;
  squadWorkerIds?: string[];
  notes?: string;
  mapUrl?: string;
  locationRemarks?: string;
  isHourlyCalculated?: boolean;
  hourlyRate?: number;
  wageType?: string;
  unitLabel?: string;
  unitRate?: number;
  workerUnitWage?: number;
  estimatedUnits?: number;
  minUnits?: number;
  specificationDetails?: any;
  deadline?: string;
}

export interface EnquiryListResponse {
  message: string;
  enquiries: ServiceEnquiry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const EnquiryService = {
  // Public/Customer enquiry creation
  async createEnquiry(
    input: CreateEnquiryInput,
    token?: string | null,
  ): Promise<{ message: string; enquiry: ServiceEnquiry }> {
    return request<{ message: string; enquiry: ServiceEnquiry }>(
      '/enquiries',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
      token,
    );
  },

  // Office Staff / Super Admin: Get all enquiries
  async getAllEnquiries(
    params: {
      status?: ServiceStatus;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
    token: string,
  ): Promise<EnquiryListResponse> {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<EnquiryListResponse>(`/enquiries${qs}`, { method: 'GET' }, token);
  },

  // Office Staff / Super Admin: Get all active workers with availability
  async getActiveWorkers(
    token: string,
  ): Promise<{ message: string; workers: WorkerWithAvailability[] }> {
    return request<{ message: string; workers: WorkerWithAvailability[] }>(
      '/enquiries/workers',
      { method: 'GET' },
      token,
    );
  },

  // Office Staff: Assign enquiry to worker (strict availability enforced by backend)
  async assignWorker(
    enquiryId: string,
    input: string | AssignWorkerInput,
    notes?: string,
    token?: string,
  ): Promise<{ message: string; enquiry: ServiceEnquiry }> {
    let bodyPayload: AssignWorkerInput;
    let actualToken = token;

    if (typeof input === 'string') {
      bodyPayload = {
        workerId: input,
        notes,
      };
    } else {
      bodyPayload = input;
      // If called with (enquiryId, inputObj, undefined, token)
      if (!actualToken && typeof notes === 'string') {
        actualToken = notes;
      }
    }

    return request<{ message: string; enquiry: ServiceEnquiry }>(
      `/enquiries/${enquiryId}/assign`,
      {
        method: 'POST',
        body: JSON.stringify(bodyPayload),
      },
      actualToken,
    );
  },

  // Worker: Get my assigned jobs
  async getWorkerJobs(
    token: string,
    status?: ServiceStatus,
  ): Promise<{ jobs: ServiceEnquiry[] }> {
    const qs = status ? `?status=${status}` : '';
    return request<{ jobs: ServiceEnquiry[] }>(
      `/enquiries/worker/my-jobs${qs}`,
      { method: 'GET' },
      token,
    );
  },

  // Worker: Accept job
  async acceptWorkerJob(
    enquiryId: string,
    data: { workerAcceptance?: string; notes?: string },
    token: string,
  ): Promise<{ message: string; enquiry: ServiceEnquiry }> {
    return request<{ message: string; enquiry: ServiceEnquiry }>(
      `/enquiries/worker/${enquiryId}/accept`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      token,
    );
  },

  // Worker: Mark reached work site
  async markReachedSite(
    enquiryId: string,
    token: string,
    notes?: string,
  ): Promise<{ message: string; enquiry: ServiceEnquiry }> {
    return request<{ message: string; enquiry: ServiceEnquiry }>(
      `/enquiries/worker/${enquiryId}/reached-site`,
      {
        method: 'PATCH',
        body: JSON.stringify({ notes }),
      },
      token,
    );
  },

  // Admin / Office Staff: Update worker pay after completion or modify work details
  async updateJobPay(
    enquiryId: string,
    data: {
      totalCalculatedWage?: number;
      workerUnitWage?: number;
      totalCalculatedCost?: number;
      unitRate?: number;
      completedUnits?: number;
      workDurationMinutes?: number;
      totalBreakMinutes?: number;
      unitLabel?: string;
      status?: string;
      workStartedAt?: string;
      workEndedAt?: string;
      notes?: string;
      paymentMode?: string;
      paymentRef?: string;
    },
    token: string,
  ): Promise<{ message: string; enquiry: ServiceEnquiry }> {
    return request<{ message: string; enquiry: ServiceEnquiry }>(
      `/enquiries/${enquiryId}/pay`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      token,
    );
  },

  // Worker: Start work timer on site
  async startWorkTimer(
    enquiryId: string,
    data: { notes?: string },
    token: string,
  ): Promise<{ message: string; enquiry: ServiceEnquiry }> {
    return request<{ message: string; enquiry: ServiceEnquiry }>(
      `/enquiries/worker/${enquiryId}/start-timer`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token,
    );
  },

  // Worker: Stop work timer on site & complete work (with units/specifications)
  async stopWorkTimer(
    enquiryId: string,
    data: {
      durationMinutes?: number;
      completedUnits?: number;
      specificationDetails?: any;
      completionNotes?: string;
    },
    token: string,
  ): Promise<{ message: string; enquiry: ServiceEnquiry }> {
    return request<{ message: string; enquiry: ServiceEnquiry }>(
      `/enquiries/worker/${enquiryId}/stop-timer`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token,
    );
  },

  // Worker: Pause timer for lunch / breakfast / emergency break
  async pauseWorkTimer(
    enquiryId: string,
    data: { reason: string; notes?: string; specificationDetails?: any },
    token: string,
  ): Promise<{ message: string; enquiry: ServiceEnquiry }> {
    return request<{ message: string; enquiry: ServiceEnquiry }>(
      `/enquiries/worker/${enquiryId}/pause-timer`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token,
    );
  },

  // Worker: Resume timer after break
  async resumeWorkTimer(
    enquiryId: string,
    data: { notes?: string; specificationDetails?: any },
    token: string,
  ): Promise<{ message: string; enquiry: ServiceEnquiry }> {
    return request<{ message: string; enquiry: ServiceEnquiry }>(
      `/enquiries/worker/${enquiryId}/resume-timer`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token,
    );
  },

  // Worker: Save draft progress (temporary unit / tree count on site)
  async saveWorkDraft(
    enquiryId: string,
    data: { completedUnits?: number; specificationDetails?: any; notes?: string },
    token: string,
  ): Promise<{ message: string; enquiry: ServiceEnquiry }> {
    return request<{ message: string; enquiry: ServiceEnquiry }>(
      `/enquiries/worker/${enquiryId}/save-draft`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token,
    );
  },

  // Worker: Update work status (IN_PROGRESS, COMPLETED)
  async updateWorkerJobStatus(
    enquiryId: string,
    status: ServiceStatus,
    notes: string | undefined,
    token: string,
    extraData?: {
      completedUnits?: number;
      specificationDetails?: any;
    },
  ): Promise<{ message: string; enquiry: ServiceEnquiry }> {
    return request<{ message: string; enquiry: ServiceEnquiry }>(
      `/enquiries/worker/${enquiryId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          notes,
          completedUnits: extraData?.completedUnits,
          specificationDetails: extraData?.specificationDetails,
        }),
      },
      token,
    );
  },

  // Worker: Toggle duty status (AVAILABLE, OFF_DUTY)
  async updateWorkerDuty(
    workerStatus: WorkerStatus,
    token: string,
  ): Promise<{ message: string; worker: any }> {
    return request<{ message: string; worker: any }>(
      '/enquiries/worker/duty-status',
      {
        method: 'PATCH',
        body: JSON.stringify({ workerStatus }),
      },
      token,
    );
  },

  // Customer: Get my submitted enquiries
  async getCustomerEnquiries(
    token: string,
  ): Promise<{ enquiries: ServiceEnquiry[] }> {
    return request<{ enquiries: ServiceEnquiry[] }>(
      '/enquiries/customer/my-enquiries',
      { method: 'GET' },
      token,
    );
  },

  // Get single enquiry by ID
  async getEnquiryById(
    id: string,
    token: string,
  ): Promise<ServiceEnquiry> {
    return request<ServiceEnquiry>(
      `/enquiries/${id}`,
      { method: 'GET' },
      token,
    );
  },
};
