'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api, User, UpdateAdminProfileData, SettingsService } from '@/services';
import {
  Shield,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  AtSign,
  Eye,
  EyeOff,
  Sliders,
  Bell,
  Check,
  Zap,
  Clock,
  Laptop,
  Globe,
  MapPin,
  Building,
  PhoneCall,
  Save,
  Sparkles,
  MessageCircle,
  FileText,
  Languages,
} from 'lucide-react';
import { useAdminTheme } from '@/context/admin-theme-context';

export default function AdminSettingsPage() {
  const { token, user: authUser, isLoading: authLoading, logout } = useAuth();
  const { isDark } = useAdminTheme();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'site' | 'profile' | 'security' | 'preferences'>('site');

  // Site Settings State (Kasaragod Operational Scope)
  const [siteName, setSiteName] = useState('KK Group');
  const [siteTagline, setSiteTagline] = useState('Professional Services & Workforce Solutions');
  const [siteTaglineMl, setSiteTaglineMl] = useState('കാസർഗോഡ് ജില്ലയിലെ വിശ്വസനീയമായ തൊഴിൽ സേവനങ്ങൾ');
  const [primaryDistrict, setPrimaryDistrict] = useState('Kasaragod');
  const [operatingAreas, setOperatingAreas] = useState('Kasaragod, Kanhangad, Nileshwaram, Uppala, Manjeshwar, Cheruvathur, Bekal, Kumbla');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [whatsappPhone, setWhatsappPhone] = useState('+91 98765 43210');
  const [supportEmail, setSupportEmail] = useState('contact@kkgroup.com');
  const [officeAddress, setOfficeAddress] = useState('KK Group Hub, Main Road, Kasaragod, Kerala - 671121');
  const [businessHours, setBusinessHours] = useState('08:00 AM - 07:00 PM (Monday - Saturday)');
  const [emergencyDispatch, setEmergencyDispatch] = useState(true);
  const [publicEnquiries, setPublicEnquiries] = useState(true);
  const [multilingualEnabled, setMultilingualEnabled] = useState(true);
  const [announcementBanner, setAnnouncementBanner] = useState('Special seasonal offers available on coconut tree maintenance and cleaning across Kasaragod.');
  const [bannerActive, setBannerActive] = useState(false);
  const [signedBy, setSignedBy] = useState('Authorized Officer');
  const [isSavingSite, setIsSavingSite] = useState(false);
  const [siteSuccess, setSiteSuccess] = useState('');

  // Profile Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & Feedback
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  // Username validation check state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const usernameDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Initial tab and site settings hydration from URL and localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'site' || tabParam === 'profile' || tabParam === 'security' || tabParam === 'preferences') {
        setActiveTab(tabParam);
      }

      try {
        const cached = localStorage.getItem('kk_site_settings');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.siteName) setSiteName(parsed.siteName);
          if (parsed.siteTagline) setSiteTagline(parsed.siteTagline);
          if (parsed.siteTaglineMl) setSiteTaglineMl(parsed.siteTaglineMl);
          if (parsed.primaryDistrict) setPrimaryDistrict(parsed.primaryDistrict);
          if (parsed.operatingAreas) setOperatingAreas(parsed.operatingAreas);
          if (parsed.contactPhone) setContactPhone(parsed.contactPhone);
          if (parsed.whatsappPhone) setWhatsappPhone(parsed.whatsappPhone);
          if (parsed.supportEmail) setSupportEmail(parsed.supportEmail);
          if (parsed.officeAddress) setOfficeAddress(parsed.officeAddress);
          if (parsed.businessHours) setBusinessHours(parsed.businessHours);
          if (parsed.emergencyDispatch !== undefined) setEmergencyDispatch(parsed.emergencyDispatch);
          if (parsed.publicEnquiries !== undefined) setPublicEnquiries(parsed.publicEnquiries);
          if (parsed.multilingualEnabled !== undefined) setMultilingualEnabled(parsed.multilingualEnabled);
          if (parsed.announcementBanner) setAnnouncementBanner(parsed.announcementBanner);
          if (parsed.bannerActive !== undefined) setBannerActive(parsed.bannerActive);
          if (parsed.signedBy) setSignedBy(parsed.signedBy);
        }
      } catch (err) {
        console.warn('Could not read local site settings:', err);
      }
    }
  }, []);

  const fetchSiteSettings = useCallback(async () => {
    if (!token) return;
    try {
      const data = await SettingsService.getAdminSettings(token);
      if (data) {
        if (data.siteName) setSiteName(data.siteName);
        if (data.siteTagline) setSiteTagline(data.siteTagline);
        if (data.siteTaglineMl) setSiteTaglineMl(data.siteTaglineMl);
        if (data.primaryDistrict) setPrimaryDistrict(data.primaryDistrict);
        if (data.operatingAreas) setOperatingAreas(data.operatingAreas);
        if (data.contactPhone) setContactPhone(data.contactPhone);
        if (data.whatsappPhone) setWhatsappPhone(data.whatsappPhone);
        if (data.supportEmail) setSupportEmail(data.supportEmail);
        if (data.officeAddress) setOfficeAddress(data.officeAddress);
        if (data.businessHours) setBusinessHours(data.businessHours);
        if (data.emergencyDispatch !== undefined) setEmergencyDispatch(data.emergencyDispatch);
        if (data.publicEnquiries !== undefined) setPublicEnquiries(data.publicEnquiries);
        if (data.multilingualEnabled !== undefined) setMultilingualEnabled(data.multilingualEnabled);
        if (data.announcementBanner) setAnnouncementBanner(data.announcementBanner);
        if (data.bannerActive !== undefined) setBannerActive(data.bannerActive);
        if (data.signedBy) setSignedBy(data.signedBy);
      }
    } catch (err) {
      console.warn('Could not load site settings from backend:', err);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    if (!authLoading) {
      if (!token || authUser?.role !== 'SUPER_ADMIN') {
        router.push('/admin/login');
        return;
      }
      fetchAdminProfile();
      fetchSiteSettings();
    }
  }, [authLoading, token, authUser, router, fetchSiteSettings]);

  const fetchAdminProfile = async () => {
    if (!token) return;
    setIsFetchingProfile(true);
    try {
      const res = await api.getProfile(token);
      if (res?.user) {
        setName(res.user.name || '');
        setUsername(res.user.username || '');
        setEmail(res.user.email || '');
        setPhone(res.user.phone || '');
      }
    } catch (err: any) {
      console.error('Failed to fetch admin profile:', err);
      // Fallback to authUser context
      if (authUser) {
        setName(authUser.name || '');
        setUsername(authUser.username || '');
        setEmail(authUser.email || '');
        setPhone(authUser.phone || '');
      }
    } finally {
      setIsFetchingProfile(false);
    }
  };

  // Debounced username availability check
  useEffect(() => {
    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }

    const clean = username.trim().toLowerCase();
    if (!clean || clean === authUser?.username?.toLowerCase()) {
      setUsernameStatus('idle');
      return;
    }

    if (clean.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');

    usernameDebounceRef.current = setTimeout(async () => {
      try {
        const res = await api.checkUsername(clean, token!);
        if (res.isAvailable) {
          setUsernameStatus('available');
        } else {
          setUsernameStatus('taken');
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 400);

    return () => {
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current);
      }
    };
  }, [username, authUser, token]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!name.trim()) {
      setProfileError('Full name is required');
      return;
    }

    if (!username.trim()) {
      setProfileError('Username is required');
      return;
    }

    if (usernameStatus === 'taken') {
      setProfileError('The username you entered is already taken');
      return;
    }

    setIsSavingProfile(true);

    try {
      const payload: UpdateAdminProfileData = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim() ? email.trim().toLowerCase() : undefined,
        mobileNumber: phone.trim() || undefined,
      };

      const res = await api.updateProfile(payload, token!);
      setProfileSuccess(res.message || 'Admin profile updated successfully');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err: any) {
      console.error('Profile update failed:', err);
      setProfileError(err?.message || 'Failed to update admin profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (!currentPassword) {
      setSecurityError('Please enter your current password');
      return;
    }

    if (!newPassword) {
      setSecurityError('Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      setSecurityError('New password must be at least 8 characters long');
      return;
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNum = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasNum || !hasSpecial) {
      setSecurityError(
        'New password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol',
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match');
      return;
    }

    setIsSavingSecurity(true);

    try {
      const payload: UpdateAdminProfileData = {
        currentPassword,
        newPassword,
      };

      const res = await api.updateProfile(payload, token!);
      setSecuritySuccess('Password updated successfully. Keep your new password secure.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecuritySuccess(''), 5000);
    } catch (err: any) {
      console.error('Security update failed:', err);
      setSecurityError(err?.message || 'Failed to update password');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleSiteSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSavingSite(true);
    setSiteSuccess('');

    try {
      const payload = {
        siteName,
        siteTagline,
        siteTaglineMl,
        primaryDistrict,
        operatingAreas,
        contactPhone,
        whatsappPhone,
        supportEmail,
        officeAddress,
        businessHours,
        emergencyDispatch,
        publicEnquiries,
        multilingualEnabled,
        announcementBanner,
        bannerActive,
        signedBy,
      };

      await SettingsService.updateSettings(token, payload);
      setSiteSuccess('Site settings, document signatory, and contact details saved and published successfully!');
      setTimeout(() => setSiteSuccess(''), 4500);
    } catch (err: any) {
      console.error('Failed to save site settings:', err);
      alert(err.message || 'Failed to update site settings');
    } finally {
      setIsSavingSite(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-14">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <span>KK Group</span>
            <span>•</span>
            <span className="text-[#2A835F]">Super Admin Center</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-100 tracking-tight flex items-center gap-3">
            <span>Admin & Site Settings</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6366F1]/10 text-[#818CF8] border border-[#6366F1]/20">
              Operations Control
            </span>
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Manage public website details, service coverage areas, contact numbers, and login security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchAdminProfile();
              fetchSiteSettings();
            }}
            disabled={isFetchingProfile || isSavingSite}
            className={`flex items-center gap-2 px-3.5 py-2 border rounded-full text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer ${
              isDark
                ? 'bg-[#181B24] hover:bg-white/[0.08] border-white/[0.08] text-zinc-300 hover:text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#6366F1] ${isFetchingProfile || isSavingSite ? 'animate-spin' : ''}`} />
            <span>Sync Settings</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Ribbon */}
      <div className={`rounded-[28px] border p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
        isDark ? 'bg-[#12141A] border-white/[0.06] shadow-sm' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#6366F1] to-[#FF5C38] p-[2px] shadow-lg shadow-[#6366F1]/20">
              <div className={`w-full h-full rounded-[22px] flex items-center justify-center font-bold text-xl ${
                isDark ? 'bg-[#12141A] text-white' : 'bg-slate-100 text-slate-900'
              }`}>
                {username?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 ${
              isDark ? 'border-[#12141A]' : 'border-white'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {name || username || 'Administrator'}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                Super Admin
              </span>
            </div>
            <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              @{username || 'admin'} • {email || 'admin@kkgroup.com'}
            </p>
            <div className={`flex items-center gap-3 text-xs mt-2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              <span className="flex items-center gap-1 font-medium">
                <Shield className="w-3.5 h-3.5 text-[#6366F1]" />
                Full System Control
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Kerala Hub
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill */}
        <div className={`flex items-center gap-1 p-1 rounded-full border self-stretch md:self-auto overflow-x-auto ${isDark ? 'bg-[#181B24] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setActiveTab('site')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-1 md:flex-initial cursor-pointer ${
              activeTab === 'site'
                ? 'bg-[#6366F1] text-white shadow-sm'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Site Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-1 md:flex-initial cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#6366F1] text-white shadow-sm'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-1 md:flex-initial cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#6366F1] text-white shadow-sm'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security &amp; Password</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-1 md:flex-initial cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-[#6366F1] text-white shadow-sm'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isFetchingProfile && activeTab !== 'site' ? (
        <div className={`rounded-[28px] border p-12 text-center flex flex-col items-center justify-center ${
          isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <Loader2 className="w-8 h-8 animate-spin text-[#6366F1] mb-3" />
          <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Loading settings...</p>
        </div>
      ) : activeTab === 'site' ? (
        /* TAB 0: Site Settings */
        <form onSubmit={handleSiteSettingsSubmit} className="space-y-6">
          {siteSuccess && (
            <div className="flex items-center gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[28px] text-emerald-500 text-sm shadow-xs">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-semibold">{siteSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1 & 2: Main Configuration Panels */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Bento Card 1: Core Branding & Identity */}
              <div className={`rounded-[28px] border p-6 space-y-5 ${
                isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className={`flex items-center justify-between pb-3 border-b ${
                  isDark ? 'border-white/[0.06]' : 'border-slate-100'
                }`}>
                  <div>
                    <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <Globe className="w-4 h-4 text-[#6366F1]" />
                      <span>Website &amp; Brand Identity</span>
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Company name and taglines shown to customers.
                    </p>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#6366F1]/10 text-[#818CF8] border border-[#6366F1]/20 font-bold">
                    Public Portal
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Site Name */}
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Website &amp; Business Name
                    </label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="KK Group"
                      className={`w-full rounded-2xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                      required
                    />
                  </div>

                  {/* English Tagline */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Tagline (English)
                    </label>
                    <input
                      type="text"
                      value={siteTagline}
                      onChange={(e) => setSiteTagline(e.target.value)}
                      placeholder="Professional Services & Workforce Solutions"
                      className={`w-full rounded-2xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Malayalam Tagline */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Tagline (Malayalam)
                    </label>
                    <input
                      type="text"
                      value={siteTaglineMl}
                      onChange={(e) => setSiteTaglineMl(e.target.value)}
                      placeholder="കാസർഗോഡ് ജില്ലയിലെ വിശ്വസനീയമായ തൊഴിൽ സേവനങ്ങൾ"
                      className={`w-full rounded-2xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Bento Card 2: Regional Coverage */}
              <div className={`rounded-[28px] border p-6 space-y-5 ${
                isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className={`flex items-center justify-between pb-3 border-b ${
                  isDark ? 'border-white/[0.06]' : 'border-slate-100'
                }`}>
                  <div>
                    <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <MapPin className="w-4 h-4 text-[#FF5C38]" />
                      <span>Service Areas &amp; Locations</span>
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Towns and panchayats covered for worker bookings.
                    </p>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                    Kasaragod
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Primary District
                    </label>
                    <input
                      type="text"
                      value={primaryDistrict}
                      onChange={(e) => setPrimaryDistrict(e.target.value)}
                      className={`w-full rounded-2xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Covered Towns &amp; Localities
                    </label>
                    <textarea
                      rows={2}
                      value={operatingAreas}
                      onChange={(e) => setOperatingAreas(e.target.value)}
                      placeholder="Kasaragod, Kanhangad, Nileshwaram, Uppala, Manjeshwar, Cheruvathur, Bekal, Kumbla..."
                      className={`w-full rounded-2xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors resize-none ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Customers selecting these areas will get fast dispatch.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bento Card 3: Contact Details */}
              <div className={`rounded-[28px] border p-6 space-y-5 ${
                isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className={`flex items-center justify-between pb-3 border-b ${
                  isDark ? 'border-white/[0.06]' : 'border-slate-100'
                }`}>
                  <div>
                    <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <PhoneCall className="w-4 h-4 text-[#6366F1]" />
                      <span>Contact &amp; Support Info</span>
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Phone numbers, WhatsApp, and office address shown on the website.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Calling Phone Number
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className={`w-full rounded-2xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className={`w-full rounded-2xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="contact@kkgroup.com"
                      className={`w-full rounded-2xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Business Hours */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Office Working Hours
                    </label>
                    <input
                      type="text"
                      value={businessHours}
                      onChange={(e) => setBusinessHours(e.target.value)}
                      placeholder="08:00 AM - 07:00 PM (Monday - Saturday)"
                      className={`w-full rounded-2xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Office Address */}
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Office Address
                    </label>
                    <input
                      type="text"
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                      placeholder="KK Group Hub, Main Road, Kasaragod, Kerala - 671121"
                      className={`w-full rounded-2xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Bento Card 4: Document Signatory */}
              <div className={`rounded-[28px] border p-6 space-y-5 ${
                isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className={`flex items-center justify-between pb-3 border-b ${
                  isDark ? 'border-white/[0.06]' : 'border-slate-100'
                }`}>
                  <div>
                    <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Invoice Signatory Name</span>
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Name that appears on quotations and invoices.
                    </p>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                    Official Documents
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Authorized Signer Name
                    </label>
                    <input
                      type="text"
                      value={signedBy}
                      onChange={(e) => setSignedBy(e.target.value)}
                      placeholder="e.g. K. K. Balakrishnan or Operations Manager"
                      className={`w-full rounded-2xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Column 3: Feature Toggles */}
            <div className="space-y-6">

              {/* Portal Features Bento Card */}
              <div className={`rounded-[28px] border p-6 space-y-5 ${
                isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Sparkles className="w-4 h-4 text-[#FF5C38]" />
                  <span>Website Controls</span>
                </h3>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Turn features on or off on your customer website.
                </p>

                <div className={`space-y-4 pt-2 divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-slate-100'}`}>
                  {/* Public Enquiries */}
                  <div className="pt-3 flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>Accept Online Bookings</p>
                      <p className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Allow visitors to book jobs online</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={publicEnquiries}
                      onChange={(e) => setPublicEnquiries(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF5C38] accent-[#FF5C38]"
                    />
                  </div>

                  {/* Emergency Dispatch */}
                  <div className="pt-3 flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>Emergency Dispatch</p>
                      <p className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Show 24/7 urgent work tag</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emergencyDispatch}
                      onChange={(e) => setEmergencyDispatch(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF5C38] accent-[#FF5C38]"
                    />
                  </div>

                  {/* Multilingual Switcher */}
                  <div className="pt-3 flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>Malayalam &amp; English</p>
                      <p className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Show language switcher to visitors</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={multilingualEnabled}
                      onChange={(e) => setMultilingualEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF5C38] accent-[#FF5C38]"
                    />
                  </div>
                </div>
              </div>

              {/* Announcement Banner Bento Card */}
              <div className={`rounded-[28px] border p-6 space-y-4 ${
                isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <FileText className="w-4 h-4 text-[#6366F1]" />
                    <span>Website Notice Banner</span>
                  </h3>
                  <label className={`flex items-center gap-2 cursor-pointer text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    <span>Show</span>
                    <input
                      type="checkbox"
                      checked={bannerActive}
                      onChange={(e) => setBannerActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF5C38] accent-[#FF5C38]"
                    />
                  </label>
                </div>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Notice displayed across customer pages for announcements or seasonal offers.
                </p>

                <textarea
                  rows={3}
                  value={announcementBanner}
                  onChange={(e) => setAnnouncementBanner(e.target.value)}
                  placeholder="Enter notice banner announcement..."
                  className={`w-full rounded-2xl px-4 py-2.5 text-xs border focus:outline-none focus:border-[#FF5C38] transition-colors resize-none ${
                    isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

            </div>
          </div>

          {/* Form Action Footer */}
          <div className={`rounded-[28px] border p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`text-xs flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>All updates apply immediately to your live customer portal.</span>
            </div>

            <button
              type="submit"
              disabled={isSavingSite}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#FF5C38] hover:bg-[#FF6B4A] text-xs font-bold text-white transition-all shadow-md shadow-[#FF5C38]/25 disabled:opacity-50 cursor-pointer"
            >
              {isSavingSite ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Site Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : activeTab === 'profile' ? (
        /* TAB 1: Profile Information */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-[28px] border p-6 space-y-6 ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Personal &amp; Contact Details
              </h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Update your name, official email address, username, and mobile phone number.
              </p>
            </div>

            {profileError && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Super Admin Full Name"
                    className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                      isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Admin Username
                </label>
                <div className="relative">
                  <AtSign className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                    placeholder="admin_username"
                    className={`w-full rounded-2xl pl-10 pr-10 py-2.5 text-sm font-mono border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                      isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    required
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && (
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    )}
                    {usernameStatus === 'available' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    {usernameStatus === 'taken' && (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                </div>
                {usernameStatus === 'taken' && (
                  <p className="text-[11px] text-rose-400 mt-1">Username is already taken.</p>
                )}
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@kkgroup.com"
                      className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className={`pt-4 border-t flex justify-end ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                <button
                  type="submit"
                  disabled={isSavingProfile || usernameStatus === 'taken'}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#FF5C38] hover:bg-[#FF6B4A] rounded-full transition-all disabled:opacity-50 shadow-md shadow-[#FF5C38]/20 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Card: Role & Access Overview */}
          <div className={`rounded-[28px] border p-6 flex flex-col justify-between space-y-6 ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center mb-4 ${
                isDark ? 'bg-[#6366F1]/10 border-[#6366F1]/20 text-[#818CF8]' : 'bg-[#6366F1]/10 border-[#6366F1]/20 text-[#6366F1]'
              }`}>
                <Shield className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Administrator Access
              </h3>
              <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                You have full access to manage jobs, workers, customer accounts, cashbook entries, and settings.
              </p>

              <div className={`space-y-3 border-t pt-4 text-xs ${isDark ? 'border-white/[0.06] text-zinc-400' : 'border-slate-100 text-slate-600'}`}>
                <div className="flex items-center justify-between">
                  <span>Account Role:</span>
                  <span className="text-[#818CF8] font-bold font-mono">SUPER_ADMIN</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Security Connection:</span>
                  <span className="text-emerald-500 font-semibold">Active &amp; Protected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Activity Logs:</span>
                  <span className="text-emerald-500 font-semibold">Enabled</span>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl p-4 border text-xs ${
              isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`font-bold block mb-1 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                Password Update
              </span>
              <p className={`text-[11px] mb-3 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                Want to change your login password?
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-xs'
                }`}
              >
                Go to Password Settings
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'security' ? (
        /* TAB 2: Security & Password */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-[28px] border p-6 space-y-6 ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Change Password
              </h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Enter your current password and pick a new secure password.
              </p>
            </div>

            {securityError && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            {securitySuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{securitySuccess}</span>
              </div>
            )}

            <form onSubmit={handleSecuritySubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Current Password
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className={`w-full rounded-2xl pl-10 pr-10 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                      isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className={`w-full rounded-2xl pl-10 pr-10 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                      isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
                      isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Requirements Checklist */}
              <div className={`rounded-2xl p-4 border space-y-2 ${
                isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-xs font-bold block ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                  Password Guidelines:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? 'text-emerald-500 font-semibold' : isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? 'text-emerald-500 font-semibold' : isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                    <span>At least 1 uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? 'text-emerald-500 font-semibold' : isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                    <span>At least 1 number</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-emerald-500 font-semibold' : isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/[^A-Za-z0-9]/.test(newPassword) ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                    <span>At least 1 special character</span>
                  </div>
                </div>
              </div>

              <div className={`pt-4 border-t flex justify-end ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                <button
                  type="submit"
                  disabled={isSavingSecurity}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#FF5C38] hover:bg-[#FF6B4A] rounded-full transition-all disabled:opacity-50 shadow-md shadow-[#FF5C38]/20 cursor-pointer"
                >
                  {isSavingSecurity ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Card: Security Recommendations */}
          <div className={`rounded-[28px] border p-6 space-y-4 ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Account Protection
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Your admin password protects full operations. Changing your password logs out other active sessions for safety.
            </p>

            <div className={`space-y-3 pt-3 border-t text-xs ${isDark ? 'border-white/[0.06] text-zinc-400' : 'border-slate-100 text-slate-600'}`}>
              <div className="flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Keep your password confidential and don&apos;t share it with anyone.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
                <span>Logins remain active securely during your session.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 3: Preferences */
        <div className={`rounded-[28px] border p-6 space-y-6 ${
          isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              System &amp; Notification Preferences
            </h3>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Configure alerts and daily summaries for your admin workspace.
            </p>
          </div>

          <div className={`divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-slate-100'}`}>
            <div className="py-4 flex items-center justify-between">
              <div>
                <p className={`text-sm font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                  New Enquiry Notifications
                </p>
                <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                  Show alert when a customer submits a new service booking request.
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-[#FF5C38] accent-[#FF5C38]"
              />
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <p className={`text-sm font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                  Worker Availability Warnings
                </p>
                <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                  Alert if no worker is available for an assigned job location.
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-[#FF5C38] accent-[#FF5C38]"
              />
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <p className={`text-sm font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                  Daily Morning Summary
                </p>
                <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                  Summarize daily attendance and work schedules each morning.
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-[#FF5C38] accent-[#FF5C38]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
