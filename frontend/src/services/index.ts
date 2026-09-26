import { authService } from './auth.service';
import { adminDashboardService, peopleService, adminProfileService } from './Admin';
import { officeStaffProfileService, officeStaffPeopleService } from './Office-Staff';
import { workerProfileService } from './Worker';
import { EnquiryService } from './enquiry.service';
import { AttendanceService } from './attendance.service';

export * from './types';
export * from './api-client';
export * from './auth.service';
export * from './Admin';
export * from './Office-Staff';
export * from './Worker';
export * from './enquiry.service';
export * from './attendance.service';

// Combined API object for backward compatibility and centralized access
export const api = {
  ...authService,
  ...peopleService,
  ...adminDashboardService,
  ...adminProfileService,
  ...EnquiryService,
  ...AttendanceService,
  officeStaffProfile: officeStaffProfileService,
  officeStaffPeople: officeStaffPeopleService,
  workerProfile: workerProfileService,
};
