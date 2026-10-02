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

export default function AdminSettingsPage() {
  const { token, user: authUser, isLoading: authLoading, logout } = useAuth();
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
      };

      await SettingsService.updateSettings(token, payload);
      setSiteSuccess('Site settings, WhatsApp number, and Kasaragod contact details saved and published successfully!');
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2A835F]/15 text-[#2A835F] border border-[#2A835F]/30">
              Kasaragod Operations Hub
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure public portal branding, Kasaragod district coverage, contact helplines, security keys, and platform controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchAdminProfile();
              fetchSiteSettings();
            }}
            disabled={isFetchingProfile || isSavingSite}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#2A835F] ${isFetchingProfile || isSavingSite ? 'animate-spin' : ''}`} />
            <span>Sync Settings</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Ribbon */}
      <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2A835F] to-emerald-700 p-[2px] shadow-lg shadow-[#2A835F]/20">
              <div className="w-full h-full bg-[#1A1C23] rounded-[14px] flex items-center justify-center font-bold text-xl text-white">
                {username?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#14151A]" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-gray-100">
                {name || username || 'Administrator'}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Active Session
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              @{username || 'admin'} • {email || 'admin@kkgroup.com'}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#2A835F]" />
                Full Privilege
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Kasaragod Headquarters
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill */}
        <div className="flex items-center gap-1 bg-[#1A1C23] p-1.5 rounded-xl border border-gray-800 self-stretch md:self-auto overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('site')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-1 md:flex-initial ${
              activeTab === 'site'
                ? 'bg-[#2A835F] text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Site Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-1 md:flex-initial ${
              activeTab === 'profile'
                ? 'bg-[#7B4DFF] text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-1 md:flex-initial ${
              activeTab === 'security'
                ? 'bg-[#7B4DFF] text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security & Password</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-1 md:flex-initial ${
              activeTab === 'preferences'
                ? 'bg-[#7B4DFF] text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isFetchingProfile && activeTab !== 'site' ? (
        <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2A835F] mb-3" />
          <p className="text-gray-400 text-sm">Loading admin credentials and security status...</p>
        </div>
      ) : activeTab === 'site' ? (
        /* TAB 0: Site Settings */
        <form onSubmit={handleSiteSettingsSubmit} className="space-y-6">
          {siteSuccess && (
            <div className="flex items-center gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm shadow-xs">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-medium">{siteSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1 & 2: Main Configuration Panels */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Bento Card 1: Core Branding & Identity */}
              <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div>
                    <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#2A835F]" />
                      <span>Site Identity & Branding</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Public business name, multilingual taglines, and public visitor facing meta details.
                    </p>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#2A835F]/15 text-[#2A835F] border border-[#2A835F]/30 font-semibold">
                    Public Portal
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Site Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Website & Business Brand Name
                    </label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="KK Group"
                      className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F]"
                      required
                    />
                  </div>

                  {/* English Tagline */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Main Tagline (English)
                    </label>
                    <input
                      type="text"
                      value={siteTagline}
                      onChange={(e) => setSiteTagline(e.target.value)}
                      placeholder="Professional Services & Workforce Solutions"
                      className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F]"
                    />
                  </div>

                  {/* Malayalam Tagline */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Main Tagline (മലയാളം)
                    </label>
                    <input
                      type="text"
                      value={siteTaglineMl}
                      onChange={(e) => setSiteTaglineMl(e.target.value)}
                      placeholder="കാസർഗോഡ് ജില്ലയിലെ വിശ്വസനീയമായ തൊഴിൽ സേവനങ്ങൾ"
                      className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F]"
                    />
                  </div>
                </div>
              </div>

              {/* Bento Card 2: Regional Coverage (Kasaragod Focus) */}
              <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div>
                    <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#2A835F]" />
                      <span>Operational District & Coverage Zones</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Target coverage region for on-demand workforce deployment and job inquiries.
                    </p>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    Kasaragod Exclusivity
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Primary Operational District
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={primaryDistrict}
                        onChange={(e) => setPrimaryDistrict(e.target.value)}
                        className="flex-1 bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-[#2A835F]"
                      />
                      
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Active Coverage Localities & Towns (Kasaragod District)
                    </label>
                    <textarea
                      rows={2}
                      value={operatingAreas}
                      onChange={(e) => setOperatingAreas(e.target.value)}
                      placeholder="Kasaragod, Kanhangad, Nileshwaram, Uppala, Manjeshwar, Cheruvathur, Bekal, Kumbla..."
                      className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] custom-scrollbar"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Customers from these regions can select fast dispatch and field technician arrivals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bento Card 3: Contact & Hotline Helpdesk */}
              <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div>
                    <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-[#2A835F]" />
                      <span>Contact Details & Helplines</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Official phone numbers, WhatsApp dispatch, email, and physical office location.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Direct Calling Helpline
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F]"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      WhatsApp Quick Booking Number
                    </label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Official Support Email
                    </label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="contact@kkgroup.com"
                      className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F]"
                    />
                  </div>

                  {/* Business Hours */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Operational Business Hours
                    </label>
                    <input
                      type="text"
                      value={businessHours}
                      onChange={(e) => setBusinessHours(e.target.value)}
                      placeholder="08:00 AM - 07:00 PM (Monday - Saturday)"
                      className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F]"
                    />
                  </div>

                  {/* Office Address */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Central Office / Hub Address
                    </label>
                    <input
                      type="text"
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                      placeholder="KK Group Hub, Main Road, Kasaragod, Kerala - 671121"
                      className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F]"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Column 3: Feature Toggles & Announcement Broadcast */}
            <div className="space-y-6">

              {/* Portal Features Bento Card */}
              <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-6 space-y-5">
                <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2A835F]" />
                  <span>Public Portal Controls</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Toggle dynamic features across customer-facing enquiry boxes and navigation.
                </p>

                <div className="space-y-4 pt-2 divide-y divide-gray-800/80">
                  {/* Public Enquiries */}
                  <div className="pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-200">Accept Enquiries</p>
                      <p className="text-[11px] text-gray-500">Allow customers to submit job orders online</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={publicEnquiries}
                      onChange={(e) => setPublicEnquiries(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2A835F] bg-[#1A1C23] border-gray-700 focus:ring-[#2A835F]"
                    />
                  </div>

                  {/* Emergency Dispatch */}
                  <div className="pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-200">Emergency Dispatch</p>
                      <p className="text-[11px] text-gray-500">24/7 urgent labor assistance badge</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emergencyDispatch}
                      onChange={(e) => setEmergencyDispatch(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2A835F] bg-[#1A1C23] border-gray-700 focus:ring-[#2A835F]"
                    />
                  </div>

                  {/* Multilingual Switcher */}
                  <div className="pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-200">Malayalam & English</p>
                      <p className="text-[11px] text-gray-500">Enable regional bilingual switcher</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={multilingualEnabled}
                      onChange={(e) => setMultilingualEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2A835F] bg-[#1A1C23] border-gray-700 focus:ring-[#2A835F]"
                    />
                  </div>
                </div>
              </div>

              {/* Announcement Banner Bento Card */}
              <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2A835F]" />
                    <span>Broadcast Notice</span>
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400">
                    <span>Show Banner</span>
                    <input
                      type="checkbox"
                      checked={bannerActive}
                      onChange={(e) => setBannerActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2A835F] bg-[#1A1C23] border-gray-700 focus:ring-[#2A835F]"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400">
                  Optional banner displayed across public customer pages for notices, offers, or weather advisories in Kasaragod.
                </p>

                <textarea
                  rows={3}
                  value={announcementBanner}
                  onChange={(e) => setAnnouncementBanner(e.target.value)}
                  placeholder="Enter notice banner announcement..."
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] custom-scrollbar"
                />
              </div>

              {/* Quick Summary Card */}
              <div className="bg-gradient-to-br from-[#2A835F]/15 to-transparent border border-[#2A835F]/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-400">Kasaragod Operations Engine</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Saving updates your public website configurations, contact hotlines, service dispatch rules, and Malayalam localization parameters immediately.
                </p>
              </div>

            </div>
          </div>

          {/* Form Action Footer */}
          <div className="bg-[#14151A] border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>All changes automatically sync with client portal and customer enquiry routing.</span>
            </div>

            <button
              type="submit"
              disabled={isSavingSite}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2A835F] hover:bg-[#236e4f] text-xs font-semibold text-white transition-all shadow-md shadow-[#2A835F]/25 disabled:opacity-50 cursor-pointer"
            >
              {isSavingSite ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Configurations...</span>
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
          <div className="lg:col-span-2 bg-[#14151A] rounded-2xl border border-gray-800 p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-100 mb-1">
                Personal & Account Details
              </h3>
              <p className="text-xs text-gray-400">
                Update your display name, official email address, username, and emergency contact number.
              </p>
            </div>

            {profileError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Super Admin Full Name"
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF]"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Admin Username (Root Identifier)
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                    placeholder="admin_username"
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-10 pr-10 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF] font-mono"
                    required
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    )}
                    {usernameStatus === 'available' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    {usernameStatus === 'taken' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                {usernameStatus === 'taken' && (
                  <p className="text-[11px] text-red-400 mt-1">Username is already taken.</p>
                )}
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Official Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@kkgroup.com"
                      className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Mobile / Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile || usernameStatus === 'taken'}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#7B4DFF] hover:bg-[#683bdf] rounded-xl transition-all disabled:opacity-50 shadow-md shadow-[#7B4DFF]/20"
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

          {/* Right Card: Security Status */}
          <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#7B4DFF]/10 border border-[#7B4DFF]/20 text-[#7B4DFF] flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-100 mb-2">
                Privilege Level & Scope
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                You have unrestricted administrative authority across the KK Group suite, including worker scheduling, attendance, leave overrides, and user management.
              </p>

              <div className="space-y-3 border-t border-gray-800/80 pt-4 text-xs">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Role:</span>
                  <span className="text-[#A78BFA] font-semibold font-mono">SUPER_ADMIN</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Edge Token Encryption:</span>
                  <span className="text-emerald-400 font-mono">RS256 / SHA-256</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Audit Logging:</span>
                  <span className="text-emerald-400">Real-Time Active</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1C23] rounded-xl p-4 border border-gray-800/80 text-xs">
              <span className="text-gray-300 font-medium block mb-1">
                Fast Action
              </span>
              <p className="text-gray-500 text-[11px] mb-3">
                Need to reset your master login credentials?
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className="w-full py-2 bg-[#2A2D35] hover:bg-[#343842] text-gray-200 rounded-lg text-xs font-medium transition-colors"
              >
                Go to Security Tab
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'security' ? (
        /* TAB 2: Security & Password */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#14151A] rounded-2xl border border-gray-800 p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-100 mb-1">
                Change Master Password
              </h3>
              <p className="text-xs text-gray-400">
                Ensure your account is protected with a strong cryptographic password.
              </p>
            </div>

            {securityError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            {securitySuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{securitySuccess}</span>
              </div>
            )}

            <form onSubmit={handleSecuritySubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-10 pr-10 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
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
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-10 pr-10 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
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
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF]"
                    required
                  />
                </div>
              </div>

              {/* Requirements Checklist */}
              <div className="bg-[#1A1C23] rounded-xl p-4 border border-gray-800/80 space-y-2">
                <span className="text-xs font-semibold text-gray-300 block">
                  Password Complexity Guidelines:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span>Minimum 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span>At least 1 uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span>At least 1 number</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${/[^A-Za-z0-9]/.test(newPassword) ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span>At least 1 special character</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSecurity}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#7B4DFF] hover:bg-[#683bdf] rounded-xl transition-all disabled:opacity-50 shadow-md shadow-[#7B4DFF]/20"
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
          <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-100">
              Security Protocol
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Super Admin passwords authenticate full platform operations. Changing this password will invalidate active token sessions across other devices.
            </p>

            <div className="space-y-3 pt-3 border-t border-gray-800/80 text-xs text-gray-400">
              <div className="flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Always use a dedicated password manager to generate cryptographic passwords.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#7B4DFF] shrink-0 mt-0.5" />
                <span>Admin passwords automatically expire from cache after token rotation.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 3: Preferences */
        <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-gray-100 mb-1">
              Platform & Dispatch Preferences
            </h3>
            <p className="text-xs text-gray-400">
              Configure system alerts, operational sound notifications, and automatic refresh intervals.
            </p>
          </div>

          <div className="divide-y divide-gray-800/80">
            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-200">
                  Real-Time Enquiry Alerts
                </p>
                <p className="text-xs text-gray-500">
                  Notify immediately when a new customer enquiry is submitted in Kerala region.
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-[#7B4DFF] bg-[#1A1C23] border-gray-700 focus:ring-[#7B4DFF]"
              />
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-200">
                  Worker Availability Anomaly Warnings
                </p>
                <p className="text-xs text-gray-500">
                  Flag work tickets when no available worker is within operational radius.
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-[#7B4DFF] bg-[#1A1C23] border-gray-700 focus:ring-[#7B4DFF]"
              />
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-200">
                  Daily Attendance Digest
                </p>
                <p className="text-xs text-gray-500">
                  Send morning summary of on-duty staff and worker rosters at 09:00 AM IST.
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-[#7B4DFF] bg-[#1A1C23] border-gray-700 focus:ring-[#7B4DFF]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
