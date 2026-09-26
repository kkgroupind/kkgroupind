export const AUTH_MESSAGES = {
  // Error Messages - Customer & Registration
  EMAIL_ALREADY_EXISTS:
    'An account with this email address already exists. Please sign in.',
  EMAIL_NOT_FOUND: 'No account found for this email address.',
  ACCOUNT_ALREADY_VERIFIED:
    'This account is already verified. Please sign in.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_DEACTIVATED:
    'Your account has been deactivated. Please contact support.',

  // Error Messages - OTP Engine
  INVALID_OR_EXPIRED_OTP:
    'Invalid or expired verification code. Please request a new one.',
  OTP_MAX_ATTEMPTS_EXCEEDED:
    'Too many failed attempts. This verification code has been permanently invalidated. Please request a new one.',
  OTP_COOLDOWN: (seconds: number) =>
    `Please wait ${seconds} seconds before requesting another verification code.`,
  OTP_REMAINING_ATTEMPTS: (remaining: number) =>
    `Invalid verification code. ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining.`,
  EMAIL_NOT_VERIFIED_RECENT:
    'Email not verified. A verification code was recently sent to your email.',
  EMAIL_NOT_VERIFIED_DISPATCHED:
    'Email not verified. A fresh verification code has been dispatched to your email.',

  // Error Messages - Staff & Portal Segregation
  INVALID_STAFF_CREDENTIALS: 'Invalid username or password.',
  INVALID_STAFF_PORTAL: 'Invalid credentials for staff portal access.',
  STAFF_ACCOUNT_DEACTIVATED:
    'Your staff account has been deactivated. Please contact Super Admin.',
  PORTAL_ACCESS_DENIED: (expectedRole: string, actualRole: string) =>
    `Access denied: This portal is designated for ${expectedRole}s only. Your account is registered as ${actualRole}. Please use your dedicated portal.`,
  INVALID_STAFF_ROLE:
    'Invalid role specified. Staff role must be either WORKER or OFFICE_STAFF.',
  USERNAME_ALREADY_EXISTS: (username: string) =>
    `A user with username '${username}' already exists. Please choose a different username.`,
  STAFF_NOT_FOUND: 'Staff member not found',
  ADMIN_CANNOT_BE_DELETED: 'Super Admin accounts cannot be deleted',

  // Error Messages - Super Admin & Guards
  INVALID_ADMIN_CREDENTIALS: 'Invalid administrator credentials.',
  ADMIN_ACCOUNT_DEACTIVATED: 'Super Admin account has been deactivated.',
  USER_NOT_FOUND: 'User profile not found',
  TOKEN_INVALID_OR_MISSING: 'Authentication token is invalid or missing',
  USER_INACTIVE_OR_NOT_FOUND: 'User account is inactive or not found',
  NO_ACCESS_PERMISSIONS: 'User does not have access permissions',
  FORBIDDEN_RESOURCE: (requiredRoles: string[], currentRole: string) =>
    `Forbidden resource: requires one of [${requiredRoles.join(', ')}], current role is ${currentRole}`,

  // Success Messages
  REGISTRATION_INITIATED:
    'Registration initiated. Please enter the 6-digit verification code sent to your email.',
  EMAIL_VERIFIED_SUCCESS:
    'Email verified successfully! You are now logged in.',
  OTP_DISPATCHED_SUCCESS:
    'A fresh verification code has been dispatched to your email.',
  CUSTOMER_SIGNIN_SUCCESS: 'Customer sign in successful.',
  STAFF_SIGNIN_SUCCESS: (role: string) => `${role} sign in successful.`,
  ADMIN_SIGNIN_SUCCESS: 'Super Admin sign in successful.',
  STAFF_CREATED_SUCCESS: (roleName: string) =>
    `${roleName} created successfully.`,
  STAFF_DELETED_SUCCESS: 'Staff member removed successfully',
} as const;

export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please provide a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  PASSWORD_COMPLEXITY:
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  USERNAME_REQUIRED: 'Username is required',
  USERNAME_MIN_LENGTH: 'Username must be at least 3 characters long',
  USERNAME_FORMAT:
    'Username can only contain letters, numbers, underscores, and dashes',
  ROLE_INVALID_STAFF: 'Role must be either WORKER or OFFICE_STAFF',
  PORTAL_ROLE_INVALID: 'portalRole must be WORKER or OFFICE_STAFF',
} as const;

export const DASHBOARD_MESSAGES = {
  STATS_FETCHED_SUCCESS: 'Admin dashboard statistics retrieved successfully',
  TRENDS_FETCHED_SUCCESS: 'Admin registration trends retrieved successfully',
  ROLES_FETCHED_SUCCESS: 'Role distribution retrieved successfully',
  RECENT_ACTIVITY_FETCHED_SUCCESS: 'Recent activities retrieved successfully',
  OVERVIEW_FETCHED_SUCCESS: 'Admin dashboard overview retrieved successfully',
} as const;

export const PEOPLE_MESSAGES = {
  PERSON_NOT_FOUND: 'Person not found',
  PERSON_CREATED_SUCCESS: (roleName: string) => `${roleName} created successfully.`,
  PERSON_UPDATED_SUCCESS: 'User updated successfully',
  PERSON_DELETED_SUCCESS: 'Person removed successfully',
  CANNOT_MANAGE_ROLE: 'Can only manage WORKER, OFFICE_STAFF, or CUSTOMER roles',
  USERNAME_AVAILABLE: 'Username is available',
  USERNAME_TAKEN: 'Username is already taken',
  EMAIL_AVAILABLE: 'Email is available',
  EMAIL_TAKEN: 'Email is already in use',
  NAME_REQUIRED: 'Name is required',
  PHONE_REQUIRED: 'Mobile number is required',
  CUSTOMER_EMAIL_REQUIRED: 'Email address is required for customer accounts',
};

export const PROFILE_MESSAGES = {
  PROFILE_FETCHED_SUCCESS: 'Profile retrieved successfully',
  PROFILE_UPDATED_SUCCESS: 'Profile updated successfully',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  PASSWORD_UPDATED_SUCCESS: 'Password updated successfully',
  EMAIL_ALREADY_IN_USE: 'Email address is already in use by another account',
  USERNAME_ALREADY_IN_USE: 'Username is already in use by another account',
} as const;

export const ENQUIRY_MESSAGES = {
  ENQUIRY_CREATED_SUCCESS: 'Your service enquiry has been submitted successfully',
  ENQUIRY_NOT_FOUND: 'Service enquiry not found',
  WORKER_NOT_FOUND: 'Worker not found or invalid role',
  WORKER_NOT_AVAILABLE: 'Selected worker is currently not available for assignment',
  ENQUIRY_ASSIGNED_SUCCESS: 'Service enquiry successfully assigned to worker',
  WORKER_STATUS_UPDATED: 'Worker availability status updated successfully',
  STATUS_UPDATED_SUCCESS: 'Work ticket status updated successfully',
  ENQUIRIES_FETCHED_SUCCESS: 'Service enquiries retrieved successfully',
  WORKERS_FETCHED_SUCCESS: 'Available workers retrieved successfully',
  JOB_ACCEPTED_SUCCESS: 'Job assignment accepted successfully',
  WORK_TIMER_STARTED: 'On-site working timer started successfully',
  WORK_TIMER_STOPPED: 'On-site work completed and hours logged successfully',
  WORKER_ALREADY_BUSY: 'Worker currently has an ongoing assignment',
  CANNOT_ASSIGN_UNAVAILABLE: 'Work can only be assigned to available workers',
} as const;

export const ATTENDANCE_MESSAGES = {
  ATTENDANCE_MARKED_SUCCESS: 'Attendance marked successfully',
  ATTENDANCE_UPDATED_SUCCESS: 'Attendance and duty status updated successfully',
  ATTENDANCE_FETCHED_SUCCESS: 'Today attendance record fetched successfully',
  STAFF_OVERVIEW_FETCHED_SUCCESS: 'Staff and worker attendance overview fetched successfully',
  OFFICE_DUTY_AVAILABLE: 'Office desk status set to Available',
  OFFICE_DUTY_OFF: 'Office desk status set to Off Duty',
  WORKER_DUTY_AVAILABLE: 'Worker status set to Available for work',
  WORKER_DUTY_OFF: 'Worker status set to Off Duty / Leave',
  INVALID_STATUS: 'Invalid attendance or availability status provided',
  UNAUTHORIZED_ATTENDANCE: 'You are not authorized to update this attendance record',
} as const;

export const SERVICE_MESSAGES = {
  SERVICE_NOT_FOUND: 'Service not found',
  SERVICE_CREATED_SUCCESS: 'Service created successfully',
  SERVICE_UPDATED_SUCCESS: 'Service updated successfully',
  SERVICE_DELETED_SUCCESS: 'Service deleted successfully',
  SERVICE_STATUS_UPDATED: 'Service status updated successfully',
  SERVICES_FETCHED_SUCCESS: 'Services retrieved successfully',
  SERVICE_SEEDED_SUCCESS: 'Services catalog synchronized successfully',
  NAME_REQUIRED: 'Service name is required',
  DESCRIPTION_REQUIRED: 'Service description is required',
  SLUG_ALREADY_EXISTS: 'A service with this name or slug already exists',
  SERVICE_ID_ALREADY_EXISTS: 'A service with this service ID already exists',
} as const;




