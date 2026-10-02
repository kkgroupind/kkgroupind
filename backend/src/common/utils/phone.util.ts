/**
 * Normalizes any phone number into standard Indian E.164 (+91XXXXXXXXXX) format.
 * All phone numbers in KK Group must be stored with country code (+91).
 */
export function normalizePhoneNumber(rawPhone?: string | null): string {
  if (!rawPhone) return '';
  const trimmed = rawPhone.trim();
  if (!trimmed) return '';

  // Strip spaces, hyphens, parentheses, and dots
  const stripped = trimmed.replace(/[\s\-\(\)\.]/g, '');

  // Extract all digits
  const allDigits = stripped.replace(/\D/g, '');
  if (!allDigits) return trimmed;

  // 1. Exactly 10 digits (Standard Indian mobile) -> +91XXXXXXXXXX
  if (allDigits.length === 10) {
    return `+91${allDigits}`;
  }

  // 2. 11 digits starting with 0 (e.g. 09447012345) -> +91XXXXXXXXXX
  if (allDigits.length === 11 && allDigits.startsWith('0')) {
    return `+91${allDigits.slice(1)}`;
  }

  // 3. 12 digits starting with 91 (e.g. 919447012345) -> +91XXXXXXXXXX
  if (allDigits.length === 12 && allDigits.startsWith('91')) {
    return `+91${allDigits.slice(2)}`;
  }

  // 4. Starts with international prefix e.g. +971...
  if (stripped.startsWith('+')) {
    return `+${allDigits}`;
  }

  // 5. Fallback: take last 10 digits as Indian mobile
  if (allDigits.length > 10) {
    return `+91${allDigits.slice(-10)}`;
  }

  return `+91${allDigits}`;
}

/**
 * Extracts the last 10 digits of a phone number for loose matching across legacy / varied formats.
 */
export function extractCorePhone(rawPhone?: string | null): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  return digits.slice(-10);
}
