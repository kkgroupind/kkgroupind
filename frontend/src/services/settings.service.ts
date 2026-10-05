import { API_BASE_URL } from './api-client';

export interface SiteSettings {
  id?: string;
  siteName: string;
  siteTagline: string;
  siteTaglineMl?: string;
  primaryDistrict: string;
  operatingAreas: string;
  contactPhone: string;
  whatsappPhone: string;
  supportEmail: string;
  officeAddress: string;
  businessHours: string;
  emergencyDispatch: boolean;
  publicEnquiries: boolean;
  multilingualEnabled: boolean;
  announcementBanner?: string | null;
  bannerActive: boolean;
  signedBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'KK Group',
  siteTagline: 'Professional Services & Workforce Solutions',
  siteTaglineMl: 'കാസർഗോഡ് ജില്ലയിലെ വിശ്വസനീയമായ തൊഴിൽ സേവനങ്ങൾ',
  primaryDistrict: 'Kasaragod',
  operatingAreas:
    'Kasaragod, Kanhangad, Nileshwaram, Uppala, Manjeshwar, Cheruvathur, Bekal, Kumbla',
  contactPhone: '+91 94470 12345',
  whatsappPhone: '+91 98460 54321',
  supportEmail: 'contact@kkgroupkerala.com',
  officeAddress: 'KK Group Hub, Main Road, Kasaragod, Kerala - 671121',
  businessHours: '08:00 AM - 07:00 PM (Monday - Saturday)',
  emergencyDispatch: true,
  publicEnquiries: true,
  multilingualEnabled: true,
  announcementBanner:
    'Special seasonal offers available on coconut tree maintenance and cleaning across Kasaragod.',
  bannerActive: false,
  signedBy: 'Authorized Officer',
};

export const SettingsService = {
  async getPublicSettings(): Promise<SiteSettings> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/public`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return (data?.data || data) as SiteSettings;
    } catch {
      // Graceful fallback to cached or default settings
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('kk_site_settings');
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {
            // ignore
          }
        }
      }
      return DEFAULT_SITE_SETTINGS;
    }
  },

  async getAdminSettings(token: string): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE_URL}/settings/admin`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch admin site settings (${res.status})`,
      );
    }

    const data = await res.json();
    return (data?.data || data) as SiteSettings;
  },

  async updateSettings(
    token: string,
    payload: Partial<SiteSettings>,
  ): Promise<{ message: string; settings: SiteSettings }> {
    const res = await fetch(`${API_BASE_URL}/settings/admin`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update site settings (${res.status})`,
      );
    }

    const data = await res.json();
    const result = data?.data || data;

    // Cache locally for fast fallback
    if (typeof window !== 'undefined' && result?.settings) {
      localStorage.setItem('kk_site_settings', JSON.stringify(result.settings));
    }

    return result;
  },
};
