import { authService } from './auth.service';
import { adminDashboardService, peopleService, adminProfileService, adminServicesService } from './Admin';
import { officeStaffProfileService, officeStaffPeopleService } from './Office-Staff';
import { workerProfileService } from './Worker';
import { EnquiryService } from './enquiry.service';
import { AttendanceService } from './attendance.service';
import { FinanceService } from './finance.service';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { SettingsService } from './settings.service';

export * from './types';
export * from './api-client';
export * from './auth.service';
export * from './Admin';
export * from './Office-Staff';
export * from './Worker';
export * from './enquiry.service';
export * from './attendance.service';
export * from './finance.service';
export * from './audit.service';
export * from './notification.service';
export * from './settings.service';

// Combined API object for backward compatibility and centralized access
export const api = {
  ...authService,
  ...peopleService,
  ...adminDashboardService,
  ...adminProfileService,
  ...adminServicesService,
  ...EnquiryService,
  ...AttendanceService,
  finance: FinanceService,
  audit: AuditService,
  notification: NotificationService,
  settings: SettingsService,
  officeStaffProfile: officeStaffProfileService,
  officeStaffPeople: officeStaffPeopleService,
  workerProfile: workerProfileService,
  adminServices: adminServicesService,
};

