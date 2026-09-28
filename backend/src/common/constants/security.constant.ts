export const SECURITY_CONSTANTS = {
  BCRYPT_SALT_ROUNDS: 10,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MS: 10 * 60 * 1000, // 10 minutes
  OTP_COOLDOWN_MS: 60 * 1000, // 60 seconds
  OTP_MAX_ATTEMPTS: 5,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
} as const;

export const REGEX_PATTERNS = {
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\]:;"'<>,.?/~`|]).{8,}$/,
  USERNAME: /^[a-zA-Z0-9_-]+$/,
} as const;

export const RATE_LIMITS = {
  GLOBAL: {
    ttl: 60000,
    limit: 30,
  },
  REGISTER: {
    ttl: 60000,
    limit: 5,
  },
  VERIFY_OTP: {
    ttl: 60000,
    limit: 5,
  },
  RESEND_OTP: {
    ttl: 60000,
    limit: 3,
  },
  LOGIN: {
    ttl: 60000,
    limit: 5,
  },
  FINANCE: {
    ttl: 60000,
    limit: 60,
  },
  AUDIT: {
    ttl: 60000,
    limit: 60,
  },
  NOTIFICATION: {
    ttl: 60000,
    limit: 60,
  },
} as const;
