export type UserRole = 'CUSTOMER' | 'SUPER_ADMIN' | 'WORKER' | 'OFFICE_STAFF';
export type StaffStatus = 'AVAILABLE' | 'OFF_DUTY';
export type WorkerStatus = 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
export type AttendanceStatus = 'PRESENT' | 'LEAVE' | 'OFF_DUTY';

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  status: AttendanceStatus;
  checkInAt: string;
  checkOutAt?: string | null;
  notes?: string | null;
}

export interface TodayAttendanceResponse {
  message: string;
  date: string;
  role: UserRole;
  isAvailable: boolean;
  isMarkedToday: boolean;
  staffStatus?: StaffStatus;
  workerStatus?: WorkerStatus;
  attendance?: AttendanceRecord | null;
  user?: Partial<User>;
}

export interface AttendanceOverviewResponse {
  message: string;
  date: string;
  counts: {
    officeStaff: {
      total: number;
      available: number;
      offDuty: number;
    };
    workers: {
      total: number;
      available: number;
      busy: number;
      offDuty: number;
    };
  };
  officeStaff: Array<{
    id: string;
    name?: string | null;
    username?: string | null;
    email?: string | null;
    phone?: string | null;
    role: UserRole;
    staffStatus: StaffStatus;
    isAvailable: boolean;
    todayAttendance?: AttendanceRecord | null;
  }>;
  workers: Array<{
    id: string;
    name?: string | null;
    username?: string | null;
    email?: string | null;
    phone?: string | null;
    role: UserRole;
    workerStatus: WorkerStatus;
    isAvailable: boolean;
    todayAttendance?: AttendanceRecord | null;
  }>;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  phone?: string | null;
  role: UserRole;
  workerStatus?: WorkerStatus | null;
  staffStatus?: StaffStatus | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  requiresVerification?: boolean;
  email?: string;
}

export interface ApiStandardResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

export type ServiceStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';


export interface ServiceEnquiry {
  id: string;
  trackingNumber: string;
  serviceName: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  location?: string | null;
  preferredDate?: string | null;
  message: string;
  status: ServiceStatus;
  notes?: string | null;
  customerId?: string | null;
  officeStaffId?: string | null;
  workerId?: string | null;
  assignedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name?: string | null; email?: string | null; phone?: string | null };
  officeStaff?: { id: string; name?: string | null; username?: string | null };
  worker?: {
    id: string;
    name?: string | null;
    username?: string | null;
    phone?: string | null;
    workerStatus: WorkerStatus;
  };
}

export interface WorkerWithAvailability {
  id: string;
  name?: string | null;
  username?: string | null;
  phone?: string | null;
  workerStatus: WorkerStatus;
  _count?: {
    workerAssignments: number;
  };
}
