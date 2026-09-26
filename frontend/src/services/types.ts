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
    avatar?: string | null;
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
    avatar?: string | null;
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
  avatar?: string | null;
  role: UserRole;
  workerStatus?: WorkerStatus | null;
  staffStatus?: StaffStatus | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  attendances?: AttendanceRecord[];
  officeEnquiries?: Array<ServiceEnquiry & {
    worker?: { id: string; name?: string | null; username?: string | null; phone?: string | null; avatar?: string | null } | null;
    customer?: { id: string; name?: string | null; email?: string | null; phone?: string | null } | null;
  }>;
  workerAssignments?: Array<ServiceEnquiry & {
    worker?: { id: string; name?: string | null; username?: string | null; phone?: string | null; avatar?: string | null } | null;
    customer?: { id: string; name?: string | null; email?: string | null; phone?: string | null; avatar?: string | null } | null;
    officeStaff?: { id: string; name?: string | null; username?: string | null; phone?: string | null; avatar?: string | null } | null;
  }>;
  _count?: {
    attendances?: number;
    officeEnquiries?: number;
    workerAssignments?: number;
  };
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
  state?: string;
  district?: string;
  city?: string | null;
  location?: string | null;
  mapUrl?: string | null;
  locationRemarks?: string | null;
  preferredDate?: string | null;
  deadline?: string | null;
  createdByRole?: UserRole;
  createdById?: string | null;
  isHourlyCalculated?: boolean;
  hourlyRate?: number | null;
  workStartedAt?: string | null;
  workEndedAt?: string | null;
  workDurationMinutes?: number | null;
  workerAcceptance?: string | null;
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
  customer?: { id: string; name?: string | null; email?: string | null; phone?: string | null; avatar?: string | null };
  officeStaff?: { id: string; name?: string | null; username?: string | null; phone?: string | null; avatar?: string | null };
  worker?: {
    id: string;
    name?: string | null;
    username?: string | null;
    phone?: string | null;
    avatar?: string | null;
    workerStatus: WorkerStatus;
  };
  creator?: {
    id: string;
    name?: string | null;
    username?: string | null;
    phone?: string | null;
    role: UserRole;
  } | null;
}

export interface WorkerWithAvailability {
  id: string;
  name?: string | null;
  username?: string | null;
  phone?: string | null;
  avatar?: string | null;
  workerStatus: WorkerStatus;
  _count?: {
    workerAssignments: number;
  };
}
