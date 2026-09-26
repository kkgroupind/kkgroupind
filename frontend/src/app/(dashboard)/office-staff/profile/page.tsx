'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import {
  officeStaffProfileService,
  AttendanceService,
  EnquiryService,
  UpdateOfficeStaffProfileData,
} from '@/services';
import {
  User as UserIcon,
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  AtSign,
  Eye,
  EyeOff,
  CalendarCheck,
  Building2,
  MapPin,
  Clock,
  ArrowLeft,
  Briefcase,
  Sparkles,
  Zap,
  Camera,
  Menu,
} from 'lucide-react';
import { StaffAvatarCropModal, OfficeStaffSidebar } from '@/components/OfficeStaff';

export default function OfficeStaffProfilePage() {
  const { token, user: authUser, isLoading: authLoading, refreshUser, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'shift'>('profile');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Profile Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [staffStatus, setStaffStatus] = useState<'AVAILABLE' | 'OFF_DUTY'>('OFF_DUTY');

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
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  // Attendance summary
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [unreadEnquiriesCount, setUnreadEnquiriesCount] = useState(0);
  const [availableWorkersCount, setAvailableWorkersCount] = useState(0);

  // Username validation check state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const usernameDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial auth check & profile fetch
  useEffect(() => {
    if (!authLoading) {
      if (!token || (authUser?.role !== 'OFFICE_STAFF' && authUser?.role !== 'SUPER_ADMIN')) {
        router.push('/office-staff/login');
        return;
      }
      fetchProfile();
      fetchAttendance();
      fetchSidebarCounts();
    }
  }, [authLoading, token, authUser, router]);

  const fetchSidebarCounts = async () => {
    if (!token) return;
    try {
      const [enqRes, wrkRes] = await Promise.allSettled([
        EnquiryService.getAllEnquiries({}, token),
        EnquiryService.getActiveWorkers(token),
      ]);
      if (enqRes.status === 'fulfilled' && enqRes.value?.enquiries) {
        const pending = enqRes.value.enquiries.filter((e: any) => e.status === 'PENDING').length;
        setUnreadEnquiriesCount(pending);
      }
      if (wrkRes.status === 'fulfilled' && wrkRes.value?.workers) {
        const available = wrkRes.value.workers.filter((w: any) => w.workerStatus === 'AVAILABLE').length;
        setAvailableWorkersCount(available);
      }
    } catch {
      // ignore background count error
    }
  };

  const fetchProfile = async () => {
    if (!token) return;
    setIsFetchingProfile(true);
    setProfileError('');
    try {
      const res = await officeStaffProfileService.getProfile(token);
      if (res?.user) {
        setName(res.user.name || '');
        setUsername(res.user.username || '');
        setEmail(res.user.email || '');
        setPhone(res.user.phone || '');
        setAvatar(res.user.avatar || null);
        if (res.user.staffStatus) {
          setStaffStatus(res.user.staffStatus);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch office staff profile:', err);
      // Fallback to authUser context
      if (authUser) {
        setName(authUser.name || '');
        setUsername(authUser.username || '');
        setEmail(authUser.email || '');
        setPhone(authUser.phone || '');
        setAvatar(authUser.avatar || null);
      }
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const fetchAttendance = async () => {
    if (!token) return;
    try {
      const att = await AttendanceService.getTodayAttendance(token);
      setTodayAttendance(att);
      if (att?.staffStatus) {
        setStaffStatus(att.staffStatus);
      }
    } catch (err) {
      console.warn('Could not fetch today attendance:', err);
    }
  };

  // 2. Debounced username availability check
  useEffect(() => {
    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }

    const clean = username.trim().toLowerCase();
    if (!clean || clean === (authUser?.username || '').toLowerCase()) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    if (clean.length < 3) {
      setUsernameStatus('taken');
      setUsernameMessage('Username must be at least 3 characters');
      return;
    }

    setUsernameStatus('checking');
    usernameDebounceRef.current = setTimeout(async () => {
      if (!token) return;
      try {
        const res = await officeStaffProfileService.checkUsername(clean, token);
        if (res.isAvailable) {
          setUsernameStatus('available');
          setUsernameMessage('Username is available');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage('Username is already taken');
        }
      } catch (e: any) {
        setUsernameStatus('idle');
      }
    }, 450);

    return () => {
      if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current);
    };
  }, [username, token, authUser?.username]);

  // 3. Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!name.trim()) {
      setProfileError('Full name is required');
      return;
    }

    if (usernameStatus === 'taken') {
      setProfileError('Please pick an available username before saving');
      return;
    }

    setIsSavingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const payload: UpdateOfficeStaffProfileData = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        mobileNumber: phone.trim() || undefined,
        email: email.trim().toLowerCase() || undefined,
        avatar: avatar || undefined,
        staffStatus,
      };

      const res = await officeStaffProfileService.updateProfile(payload, token);
      setProfileSuccess(res.message || 'Profile updated successfully!');
      try {
        await refreshUser();
      } catch (e) {
        // ignore sync failure
      }
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 4. Handle Security / Password Update
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!currentPassword) {
      setSecurityError('Current password is required to set a new password');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setSecurityError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match');
      return;
    }

    setIsSavingSecurity(true);
    setSecurityError('');
    setSecuritySuccess('');

    try {
      const payload: UpdateOfficeStaffProfileData = {
        currentPassword,
        newPassword,
      };

      const res = await officeStaffProfileService.updateProfile(payload, token);
      setSecuritySuccess(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecuritySuccess(''), 4000);
    } catch (err: any) {
      setSecurityError(err?.message || 'Failed to update password. Please check current password.');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  // 5. Handle Desk Status Toggle
  const handleToggleDeskStatus = async () => {
    if (!token || isTogglingStatus) return;
    setIsTogglingStatus(true);
    const newStatus = staffStatus === 'AVAILABLE' ? 'OFF_DUTY' : 'AVAILABLE';

    try {
      await AttendanceService.updateStatus(
        newStatus,
        token,
        `Desk status switched to ${newStatus} from profile desk controls`,
      );

      setStaffStatus(newStatus);
      try {
        await refreshUser();
      } catch (e) {
        // ignore sync failure
      }
      setProfileSuccess(`Office desk presence set to ${newStatus === 'AVAILABLE' ? 'Available' : 'Off Duty'}`);
      setTimeout(() => setProfileSuccess(''), 3000);
      fetchAttendance();
    } catch (err: any) {
      console.error('Failed to toggle desk status:', err);
      setProfileError('Failed to update desk status');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Password Policy Checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  if (authLoading || isFetchingProfile) {
    return (
      <div className="min-h-screen bg-[#0A0B0E] flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#2A835F] mb-3" />
        <p className="text-sm font-medium tracking-wide">Loading Office Staff Credentials...</p>
        <span className="text-xs text-gray-600 mt-1">കേരള ഓപ്പറേഷൻസ് ഡെസ്ക്</span>
      </div>
    );
  }

  const isAvailable = staffStatus === 'AVAILABLE';

  return (
    <div className="min-h-screen bg-[#0D0E12] text-gray-100 flex">
      {/* Navigation Sidebar */}
      <OfficeStaffSidebar
        activeSection="profile"
        onSelectSection={(sec) => {
          if (sec === 'profile') return;
          if (sec === 'people-customers') {
            router.push('/office-staff/people?role=CUSTOMER');
            return;
          }
          if (sec === 'people-workers') {
            router.push('/office-staff/people?role=WORKER');
            return;
          }
          router.push(`/office-staff/dashboard?section=${sec}`);
        }}
        isAvailable={isAvailable}
        onToggleAvailability={handleToggleDeskStatus}
        userName={name || authUser?.name || authUser?.username || 'Office Staff'}
        userRole={authUser?.role || 'OFFICE_STAFF'}
        userAvatar={avatar || authUser?.avatar}
        unreadEnquiriesCount={unreadEnquiriesCount}
        availableWorkersCount={availableWorkersCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={() => {
          if (logout) {
            logout();
            router.push('/office-staff/login');
          }
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 bg-[#0D0E12]">
        {/* Top Header Navigation Bar */}
        <header className="border-b border-gray-800/80 bg-[#0E1017]/95 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
            >
              <Menu className="w-4 h-4" />
            </button>
            <Link
              href="/office-staff/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all text-xs font-semibold border border-gray-700/60"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Desk</span>
            </Link>
            <div className="h-4 w-px bg-gray-800 hidden sm:block" />
            <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Staff Profile & Desk Settings
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#EBF6F1]/10 text-[#2A835F] border border-[#2A835F]/30">
                OFFICE STAFF
              </span>
            </div>
            <span className="text-[11px] text-gray-400 hidden sm:inline">
              ഉദ്യോഗസ്ഥ വിവരങ്ങൾ • കേരള ഓപ്പറേഷൻസ് ഡെസ്ക്
            </span>
          </div>
        </div>

        {/* Live Desk Status Toggle on Header */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleDeskStatus}
            disabled={isTogglingStatus}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              isAvailable
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{isAvailable ? 'Desk Available' : 'Off Duty'}</span>
            {isTogglingStatus && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Global Feedback Banners */}
        {profileSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{profileSuccess}</span>
          </div>
        )}
        {profileError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{profileError}</span>
          </div>
        )}

        {/* 2-Column Bento Chassis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Identity Bento Card */}
          <div className="lg:col-span-4 space-y-5">
            {/* Identity Card */}
            <div className="bg-[#12141C]/90 rounded-2xl border border-gray-800/80 p-5 shadow-xl relative overflow-hidden backdrop-blur-xl">
              {/* Subtle ambient emerald background flare */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2A835F]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col items-center text-center">
                <div
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="relative mb-3 group cursor-pointer"
                  title="Click to crop & update profile picture"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700/80 group-hover:border-[#2A835F] flex items-center justify-center text-white text-2xl font-black shadow-lg overflow-hidden transition-all">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (name || authUser?.name || 'S').charAt(0).toUpperCase()
                    )}
                  </div>
                  {/* Camera overlay on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Camera className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#12141C] flex items-center justify-center ${
                      isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="mb-2 text-[11px] font-semibold text-[#2A835F] hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  <span>{avatar ? 'Change Photo' : 'Upload Photo'}</span>
                </button>

                <h2 className="text-base font-bold text-white tracking-tight">
                  {name || authUser?.name || 'Office Staff'}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                  <AtSign className="w-3 h-3 text-[#2A835F]" />
                  <span className="font-mono text-gray-300">
                    {username || authUser?.username || 'officestaff'}
                  </span>
                </div>

                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A1E29] border border-gray-700/60 text-[11px] font-semibold text-gray-300">
                  <Building2 className="w-3 h-3 text-[#2A835F]" />
                  <span>Operations & Dispatch Desk</span>
                </div>
              </div>

              {/* Status & Regional Details */}
              <div className="mt-5 pt-4 border-t border-gray-800/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    Regional Operations
                  </span>
                  <span className="font-medium text-gray-200">Kerala, India</span>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    Current Presence
                  </span>
                  <span
                    className={`font-semibold ${
                      isAvailable ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {isAvailable ? 'Available on Desk' : 'Off Duty'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
                    Security Clearance
                  </span>
                  <span className="font-mono text-emerald-400 text-[11px]">Level-2 Desk Staff</span>
                </div>
              </div>

              {/* Toggle Presence Action Button */}
              <button
                type="button"
                onClick={handleToggleDeskStatus}
                disabled={isTogglingStatus}
                className={`mt-5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  isAvailable
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-[#2A835F]/15 hover:bg-[#2A835F]/25 text-emerald-300 border-[#2A835F]/40'
                }`}
              >
                {isTogglingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isAvailable ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Set Status to Off Duty</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Set Status to Available</span>
                  </>
                )}
              </button>
            </div>

            {/* Sidebar Navigation Tabs */}
            <div className="bg-[#12141C]/90 rounded-2xl border border-gray-800/80 p-2 shadow-xl space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  activeTab === 'profile'
                    ? 'bg-[#2A835F] text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <UserIcon className="w-4 h-4 shrink-0" />
                <div className="flex flex-col">
                  <span>Personal & Contact Info</span>
                  <span className="text-[10px] opacity-75 font-normal">
                    പേഴ്സണൽ വിവരങ്ങൾ
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  activeTab === 'security'
                    ? 'bg-[#2A835F] text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <Lock className="w-4 h-4 shrink-0" />
                <div className="flex flex-col">
                  <span>Security & Password</span>
                  <span className="text-[10px] opacity-75 font-normal">
                    സുരക്ഷ & പാസ്‌വേഡ്
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('shift')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  activeTab === 'shift'
                    ? 'bg-[#2A835F] text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <CalendarCheck className="w-4 h-4 shrink-0" />
                <div className="flex flex-col">
                  <span>Shift & Desk Attendance</span>
                  <span className="text-[10px] opacity-75 font-normal">
                    ഹാജർ വിവരങ്ങൾ
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Form Body */}
          <div className="lg:col-span-8">
            {/* TAB 1: Profile Information */}
            {activeTab === 'profile' && (
              <div className="bg-[#12141C]/90 rounded-2xl border border-gray-800/80 p-6 sm:p-7 shadow-xl space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-[#2A835F]" />
                    <span>Personal & Contact Credentials</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage your identity details across the KK Group operational management portal.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* Avatar Upload Banner */}
                  <div className="p-4 rounded-xl bg-[#0E1017] border border-gray-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-700 bg-gray-800 flex items-center justify-center font-bold text-gray-300 shrink-0">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (name || 'S').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Staff Profile Photo</div>
                        <div className="text-[11px] text-gray-400">
                          Framed and hosted on Cloudinary CDN
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#2A835F]" />
                      <span>{avatar ? 'Change & Crop' : 'Upload Photo'}</span>
                    </button>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Full Staff Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sreejith K. Nair"
                        required
                        className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#2A835F] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Username with live debounced availability */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-300">
                        Username <span className="text-rose-400">*</span>
                      </label>
                      {usernameStatus === 'checking' && (
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin text-[#2A835F]" />
                          Checking availability...
                        </span>
                      )}
                      {usernameStatus === 'available' && (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {usernameMessage}
                        </span>
                      )}
                      {usernameStatus === 'taken' && (
                        <span className="text-[11px] text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {usernameMessage}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                        <AtSign className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="officestaff_kerala"
                        required
                        className={`w-full bg-[#0E1017] border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none transition-colors ${
                          usernameStatus === 'available'
                            ? 'border-emerald-500/60 focus:border-emerald-500'
                            : usernameStatus === 'taken'
                            ? 'border-rose-500/60 focus:border-rose-500'
                            : 'border-gray-800 focus:border-[#2A835F]'
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Must be at least 3 characters. Letters, numbers, dashes, and underscores only.
                    </p>
                  </div>

                  {/* Contact Grid: Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300">
                        Phone / Mobile (Kerala +91)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98460 12345"
                          className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#2A835F] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="staff@kkgroup.ind"
                          className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#2A835F] transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Staff Desk Status Selection */}
                  <div className="pt-2">
                    <label className="text-xs font-semibold text-gray-300 block mb-2">
                      Office Desk Availability
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setStaffStatus('AVAILABLE')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          staffStatus === 'AVAILABLE'
                            ? 'bg-[#2A835F]/15 border-[#2A835F] text-white shadow-xs'
                            : 'bg-[#0E1017] border-gray-800 text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <div>
                            <div className="text-xs font-bold text-white">Available on Desk</div>
                            <div className="text-[10px] text-gray-400">Ready to take calls & dispatch</div>
                          </div>
                        </div>
                        {staffStatus === 'AVAILABLE' && (
                          <CheckCircle2 className="w-4 h-4 text-[#2A835F]" />
                        )}
                      </div>

                      <div
                        onClick={() => setStaffStatus('OFF_DUTY')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          staffStatus === 'OFF_DUTY'
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-xs'
                            : 'bg-[#0E1017] border-gray-800 text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <div>
                            <div className="text-xs font-bold text-white">Off Duty / Break</div>
                            <div className="text-[10px] text-gray-400">Not handling live dispatch</div>
                          </div>
                        </div>
                        {staffStatus === 'OFF_DUTY' && (
                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingProfile || usernameStatus === 'taken'}
                      className="px-5 py-2.5 rounded-xl bg-[#2A835F] hover:bg-[#236b4e] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Update Staff Profile</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: Security & Password */}
            {activeTab === 'security' && (
              <div className="bg-[#12141C]/90 rounded-2xl border border-gray-800/80 p-6 sm:p-7 shadow-xl space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#2A835F]" />
                    <span>Security & Access Key Management</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Enforce strong authentication standards compliant with KK Group operations security.
                  </p>
                </div>

                {securitySuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{securitySuccess}</span>
                  </div>
                )}
                {securityError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{securityError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveSecurity} className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Current Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                        className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#2A835F] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300"
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
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      New Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 chars with uppercase, number & symbol"
                        required
                        className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#2A835F] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Checklist */}
                  {newPassword && (
                    <div className="p-3 bg-[#0E1017] rounded-xl border border-gray-800/80 space-y-1.5">
                      <span className="text-[11px] font-semibold text-gray-400">
                        Password Requirements:
                      </span>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <span
                          className={`flex items-center gap-1.5 ${
                            hasMinLength ? 'text-emerald-400' : 'text-gray-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              hasMinLength ? 'bg-emerald-400' : 'bg-gray-600'
                            }`}
                          />
                          8+ characters
                        </span>
                        <span
                          className={`flex items-center gap-1.5 ${
                            hasUpper ? 'text-emerald-400' : 'text-gray-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              hasUpper ? 'bg-emerald-400' : 'bg-gray-600'
                            }`}
                          />
                          Uppercase letter
                        </span>
                        <span
                          className={`flex items-center gap-1.5 ${
                            hasLower ? 'text-emerald-400' : 'text-gray-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              hasLower ? 'bg-emerald-400' : 'bg-gray-600'
                            }`}
                          />
                          Lowercase letter
                        </span>
                        <span
                          className={`flex items-center gap-1.5 ${
                            hasNumber && hasSpecial ? 'text-emerald-400' : 'text-gray-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              hasNumber && hasSpecial ? 'bg-emerald-400' : 'bg-gray-600'
                            }`}
                          />
                          Number & special symbol
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Confirm New Password <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#2A835F] transition-colors"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-[11px] text-rose-400">Passwords do not match</p>
                    )}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingSecurity}
                      className="px-5 py-2.5 rounded-xl bg-[#2A835F] hover:bg-[#236b4e] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      {isSavingSecurity ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Change Security Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: Shift & Desk Attendance */}
            {activeTab === 'shift' && (
              <div className="bg-[#12141C]/90 rounded-2xl border border-gray-800/80 p-6 sm:p-7 shadow-xl space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-[#2A835F]" />
                    <span>Desk Attendance & Shift Log</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Your daily check-in log and field operations activity for today.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#0E1017] border border-gray-800 space-y-1">
                    <span className="text-[11px] text-gray-400">Today's Duty Status</span>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isAvailable ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <span>{isAvailable ? 'AVAILABLE (On Duty)' : 'OFF DUTY'}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0E1017] border border-gray-800 space-y-1">
                    <span className="text-[11px] text-gray-400">Desk Check-in Record</span>
                    <div className="text-sm font-bold text-gray-200">
                      {todayAttendance?.attendance?.checkInAt
                        ? new Date(todayAttendance.attendance.checkInAt).toLocaleTimeString()
                        : 'Active Session'}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1017] border border-gray-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-200">
                      Operations Management Workspace
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Dispatch field workers, schedule customer enquiries, and monitor live jobs.
                    </p>
                  </div>
                  <Link
                    href="/office-staff/dashboard"
                    className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold border border-gray-700/60 transition-colors"
                  >
                    Open Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>

      {/* Staff Avatar Cropping & Upload Modal */}
      <StaffAvatarCropModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onAvatarUpdated={async (newUrl) => {
          setAvatar(newUrl);
          setProfileSuccess('Profile picture updated successfully via Cloudinary!');
          try {
            await refreshUser();
          } catch (e) {
            // ignore
          }
          setTimeout(() => setProfileSuccess(''), 4000);
        }}
        token={token || ''}
        currentAvatar={avatar}
        userName={name || authUser?.name || 'Office Staff'}
      />
    </div>
  );
}
