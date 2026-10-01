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
import { StaffAvatarCropModal, OfficeStaffSidebar, OfficeStaffLoadingScreen } from '@/components/OfficeStaff';

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
      <OfficeStaffLoadingScreen
        title="Loading Office Staff Profile..."
        subtitle="ഉദ്യോഗസ്ഥ വിവരങ്ങൾ • കേരള ഓപ്പറേഷൻസ് ഡെസ്ക്"
        statusText="Retrieving encrypted profile credentials..."
      />
    );
  }

  const isAvailable = staffStatus === 'AVAILABLE';

  return (
    <div className="min-h-screen bg-[#ABD2FA] text-slate-800 flex font-sans antialiased">
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
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 bg-[#ABD2FA]">
        {/* Top Header Navigation Bar */}
        <header className="border-b border-[#7692FF]/30 bg-white/95 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-[#091540] border border-slate-200"
            >
              <Menu className="w-4 h-4" />
            </button>
            <Link
              href="/office-staff/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#091540] transition-all text-xs font-bold border border-slate-200 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Desk</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-[#091540] tracking-tight">
                  Staff Profile & Desk Settings
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#1B2CC1]/10 text-[#1B2CC1] border border-[#1B2CC1]/30">
                  OFFICE STAFF • KERALA
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                ഉദ്യോഗസ്ഥ വിവരങ്ങൾ • കേരള ഓപ്പറേഷൻസ് ഡെസ്ക്
              </span>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                fetchProfile();
                fetchAttendance();
                fetchSidebarCounts();
              }}
              title="Refresh profile and live counts"
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-[#091540] border border-slate-200 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Live Desk Status Toggle on Header */}
            <button
              type="button"
              onClick={handleToggleDeskStatus}
              disabled={isTogglingStatus}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                isAvailable
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{isAvailable ? 'Desk Available' : 'Off Duty'}</span>
              {isTogglingStatus && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6">
          {/* Global Feedback Banners */}
          {profileSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{profileSuccess}</span>
            </div>
          )}
          {profileError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{profileError}</span>
            </div>
          )}

          {/* 2-Column Bento Chassis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Identity Bento Card */}
            <div className="lg:col-span-4 space-y-5">
              {/* Identity Card */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-md relative overflow-hidden">
                {/* Top ambient brand bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7692FF] via-[#1B2CC1] to-[#7692FF]" />

                <div className="flex flex-col items-center text-center pt-2">
                  <div
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="relative mb-3 group cursor-pointer"
                    title="Click to crop & update profile picture"
                  >
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-200 group-hover:border-[#1B2CC1] flex items-center justify-center text-[#091540] text-3xl font-black shadow-lg overflow-hidden transition-all ring-4 ring-white relative">
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
                    <div className="absolute inset-0 rounded-3xl bg-[#091540]/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                      <Camera className="w-6 h-6 text-[#ABD2FA]" />
                      <span className="text-[9px] font-bold mt-1 text-white">CHANGE</span>
                    </div>
                    <span
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                        isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="mb-2 text-xs font-bold text-[#1B2CC1] hover:text-[#15239E] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{avatar ? 'Change Profile Picture' : 'Upload Profile Picture'}</span>
                  </button>

                  <h2 className="text-lg font-black text-[#091540] tracking-tight">
                    {name || authUser?.name || 'Office Staff'}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <AtSign className="w-3.5 h-3.5 text-[#1B2CC1]" />
                    <span className="font-mono text-slate-600 font-medium">
                      {username || authUser?.username || 'officestaff'}
                    </span>
                  </div>

                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B2CC1]/10 border border-[#1B2CC1]/25 text-[11px] font-bold text-[#1B2CC1]">
                    <Building2 className="w-3.5 h-3.5 text-[#1B2CC1]" />
                    <span>Operations & Dispatch Desk</span>
                  </div>
                </div>

                {/* Operations Bento Mini Grid */}
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Presence</span>
                    <span className={`text-xs font-bold mt-0.5 flex items-center gap-1.5 ${isAvailable ? 'text-emerald-700' : 'text-amber-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {isAvailable ? 'Available' : 'Off Duty'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Desk Session</span>
                    <span className="text-xs font-bold text-[#091540] mt-0.5 block truncate">
                      {todayAttendance?.attendance?.checkInAt
                        ? new Date(todayAttendance.attendance.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Active Today'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Enquiries</span>
                    <span className="text-xs font-black text-[#1B2CC1] mt-0.5 block">
                      {unreadEnquiriesCount} in Queue
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Crew</span>
                    <span className="text-xs font-black text-emerald-700 mt-0.5 block">
                      {availableWorkersCount} Ready
                    </span>
                  </div>
                </div>

                {/* Regional Details */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Jurisdiction
                    </span>
                    <span className="font-semibold text-slate-700">Kerala Operations</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      Security Level
                    </span>
                    <span className="font-mono text-[#1B2CC1] text-[11px] font-bold">Level-2 Dispatch Staff</span>
                  </div>
                </div>

                {/* Toggle Presence Action Button */}
                <button
                  type="button"
                  onClick={handleToggleDeskStatus}
                  disabled={isTogglingStatus}
                  className={`mt-5 w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer shadow-sm ${
                    isAvailable
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border-amber-500/30'
                      : 'bg-[#1B2CC1] hover:bg-[#15239E] text-white border-transparent shadow-md shadow-[#1B2CC1]/25'
                  }`}
                >
                  {isTogglingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isAvailable ? (
                    <>
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span>Switch Status to Off Duty</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-[#ABD2FA]" />
                      <span>Switch Status to Available</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sidebar Navigation Tabs */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/80 p-2.5 shadow-md space-y-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left group cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-[#1B2CC1] text-white shadow-lg shadow-[#1B2CC1]/25 ring-1 ring-[#1B2CC1]'
                      : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-[#091540]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        activeTab === 'profile'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-[#1B2CC1]/10 group-hover:text-[#1B2CC1]'
                      }`}
                    >
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block leading-tight">Personal & Contact Info</span>
                      <span
                        className={`text-[10px] font-normal leading-tight ${
                          activeTab === 'profile' ? 'text-white/80' : 'text-slate-400'
                        }`}
                      >
                        പേഴ്സണൽ വിവരങ്ങൾ
                      </span>
                    </div>
                  </div>
                  {activeTab === 'profile' && (
                    <span className="w-1.5 h-4 rounded-full bg-white shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left group cursor-pointer ${
                    activeTab === 'security'
                      ? 'bg-[#1B2CC1] text-white shadow-lg shadow-[#1B2CC1]/25 ring-1 ring-[#1B2CC1]'
                      : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-[#091540]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        activeTab === 'security'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-[#1B2CC1]/10 group-hover:text-[#1B2CC1]'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block leading-tight">Security & Password</span>
                      <span
                        className={`text-[10px] font-normal leading-tight ${
                          activeTab === 'security' ? 'text-white/80' : 'text-slate-400'
                        }`}
                      >
                        സുരക്ഷ & പാസ്‌വേഡ്
                      </span>
                    </div>
                  </div>
                  {activeTab === 'security' && (
                    <span className="w-1.5 h-4 rounded-full bg-white shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('shift')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left group cursor-pointer ${
                    activeTab === 'shift'
                      ? 'bg-[#1B2CC1] text-white shadow-lg shadow-[#1B2CC1]/25 ring-1 ring-[#1B2CC1]'
                      : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-[#091540]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        activeTab === 'shift'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-[#1B2CC1]/10 group-hover:text-[#1B2CC1]'
                      }`}
                    >
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block leading-tight">Shift & Desk Attendance</span>
                      <span
                        className={`text-[10px] font-normal leading-tight ${
                          activeTab === 'shift' ? 'text-white/80' : 'text-slate-400'
                        }`}
                      >
                        ഹാജർ വിവരങ്ങൾ
                      </span>
                    </div>
                  </div>
                  {activeTab === 'shift' && (
                    <span className="w-1.5 h-4 rounded-full bg-white shrink-0" />
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Form Body */}
            <div className="lg:col-span-8">
              {/* TAB 1: Profile Information */}
              {activeTab === 'profile' && (
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/80 p-6 sm:p-8 shadow-md space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-[#1B2CC1]/10 text-[#1B2CC1] border border-[#1B2CC1]/20 flex items-center justify-center shrink-0">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#091540] tracking-tight">
                        Personal & Contact Credentials
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage your staff profile details across the KK Group operational management portal.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    {/* Avatar Upload Banner */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white bg-slate-200 flex items-center justify-center font-bold text-[#091540] shrink-0 shadow-sm">
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
                          <div className="text-xs font-bold text-[#091540]">Staff Profile Photo</div>
                          <div className="text-[11px] text-slate-500">
                            Square crop hosted on Cloudinary CDN
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#091540] text-xs font-bold border border-slate-200 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#1B2CC1]" />
                        <span>{avatar ? 'Change & Crop' : 'Upload Photo'}</span>
                      </button>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Full Staff Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Sreejith K. Nair"
                          required
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B2CC1]/15 transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Username with live debounced availability */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          Username <span className="text-rose-500">*</span>
                        </label>
                        {usernameStatus === 'checking' && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin text-[#1B2CC1]" />
                            Checking availability...
                          </span>
                        )}
                        {usernameStatus === 'available' && (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {usernameMessage}
                          </span>
                        )}
                        {usernameStatus === 'taken' && (
                          <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {usernameMessage}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <AtSign className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="officestaff_kerala"
                          required
                          className={`w-full bg-slate-50 border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#091540] placeholder-slate-400 focus:outline-none transition-all font-medium ${
                            usernameStatus === 'available'
                              ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
                              : usernameStatus === 'taken'
                              ? 'border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                              : 'border-slate-200 focus:border-[#1B2CC1] focus:ring-2 focus:ring-[#1B2CC1]/15'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Letters, numbers, and underscores only. Minimum 3 characters.
                      </p>
                    </div>

                    {/* Contact Grid: Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone Number */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Phone / Mobile (Kerala +91)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Phone className="w-4 h-4" />
                          </div>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98460 12345"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B2CC1]/15 transition-all font-medium"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Official Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="staff@kkgroup.ind"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B2CC1]/15 transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Staff Desk Status Selection Cards */}
                    <div className="pt-2">
                      <label className="text-xs font-bold text-slate-700 block mb-2">
                        Office Desk Presence State
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          onClick={() => setStaffStatus('AVAILABLE')}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                            staffStatus === 'AVAILABLE'
                              ? 'bg-[#1B2CC1]/10 border-[#1B2CC1] text-[#091540] shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                            <div>
                              <div className="text-xs font-bold text-[#091540]">Available on Desk</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">Ready to receive enquiries & dispatch</div>
                            </div>
                          </div>
                          {staffStatus === 'AVAILABLE' && (
                            <CheckCircle2 className="w-5 h-5 text-[#1B2CC1]" />
                          )}
                        </div>

                        <div
                          onClick={() => setStaffStatus('OFF_DUTY')}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                            staffStatus === 'OFF_DUTY'
                              ? 'bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
                            <div>
                              <div className="text-xs font-bold text-[#091540]">Off Duty / Break</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">Not handling live customer calls</div>
                            </div>
                          </div>
                          {staffStatus === 'OFF_DUTY' && (
                            <CheckCircle2 className="w-5 h-5 text-amber-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingProfile || usernameStatus === 'taken'}
                        className="px-6 py-3 rounded-xl bg-[#1B2CC1] hover:bg-[#15239E] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[#1B2CC1]/25 flex items-center gap-2 cursor-pointer"
                      >
                        {isSavingProfile ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Save Profile Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: Security & Password */}
              {activeTab === 'security' && (
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/80 p-6 sm:p-8 shadow-md space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-[#1B2CC1]/10 text-[#1B2CC1] border border-[#1B2CC1]/20 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#091540] tracking-tight">
                        Security & Access Key Management
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Enforce strong password standards compliant with KK Group operations security.
                      </p>
                    </div>
                  </div>

                  {securitySuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{securitySuccess}</span>
                    </div>
                  )}
                  {securityError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{securityError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveSecurity} className="space-y-5">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Current Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          required
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B2CC1]/15 transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
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
                      <label className="text-xs font-bold text-slate-700">
                        New Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 8 chars with uppercase, number & symbol"
                          required
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B2CC1]/15 transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
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
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                          Password Requirements Checklist:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <span
                            className={`flex items-center gap-2 transition-colors ${
                              hasMinLength ? 'text-emerald-700 font-bold' : 'text-slate-400'
                            }`}
                          >
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 ${
                                hasMinLength ? 'text-emerald-600' : 'text-slate-300'
                              }`}
                            />
                            <span>At least 8 characters</span>
                          </span>
                          <span
                            className={`flex items-center gap-2 transition-colors ${
                              hasUpper ? 'text-emerald-700 font-bold' : 'text-slate-400'
                            }`}
                          >
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 ${
                                hasUpper ? 'text-emerald-600' : 'text-slate-300'
                              }`}
                            />
                            <span>Uppercase letter (A-Z)</span>
                          </span>
                          <span
                            className={`flex items-center gap-2 transition-colors ${
                              hasLower ? 'text-emerald-700 font-bold' : 'text-slate-400'
                            }`}
                          >
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 ${
                                hasLower ? 'text-emerald-600' : 'text-slate-300'
                              }`}
                            />
                            <span>Lowercase letter (a-z)</span>
                          </span>
                          <span
                            className={`flex items-center gap-2 transition-colors ${
                              hasNumber && hasSpecial ? 'text-emerald-700 font-bold' : 'text-slate-400'
                            }`}
                          >
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 ${
                                hasNumber && hasSpecial ? 'text-emerald-600' : 'text-slate-300'
                              }`}
                            />
                            <span>Number & special symbol</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Confirm New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Confirm New Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl px-3.5 py-2.5 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B2CC1]/15 transition-all font-medium"
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-[11px] text-rose-500 font-semibold">Passwords do not match</p>
                      )}
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingSecurity}
                        className="px-6 py-3 rounded-xl bg-[#1B2CC1] hover:bg-[#15239E] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[#1B2CC1]/25 flex items-center gap-2 cursor-pointer"
                      >
                        {isSavingSecurity ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Update Security Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: Shift & Desk Attendance */}
              {activeTab === 'shift' && (
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/80 p-6 sm:p-8 shadow-md space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-[#1B2CC1]/10 text-[#1B2CC1] border border-[#1B2CC1]/20 flex items-center justify-center shrink-0">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#091540] tracking-tight">
                        Desk Attendance & Shift Log
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Your daily check-in log and field operations activity for today.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Duty Status</span>
                      <div className="text-base font-black text-[#091540] flex items-center gap-2 pt-1">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            isAvailable ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500'
                          }`}
                        />
                        <span>{isAvailable ? 'AVAILABLE (On Duty)' : 'OFF DUTY'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 pt-1">
                        {isAvailable
                          ? 'You are actively listed as available to receive enquiries and dispatch work orders.'
                          : 'You are currently marked as off duty or taking a desk break.'}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Desk Check-in Record</span>
                      <div className="text-base font-black text-slate-800 pt-1">
                        {todayAttendance?.attendance?.checkInAt
                          ? new Date(todayAttendance.attendance.checkInAt).toLocaleTimeString()
                          : 'Active Operational Session'}
                      </div>
                      <p className="text-[11px] text-slate-500 pt-1">
                        Session authenticated with KK Group operations edge server.
                      </p>
                    </div>
                  </div>

                  {/* Operations Workspace Quick Launch */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-[#091540]">
                        Operations Management Workspace
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Dispatch field workers, schedule customer enquiries, and monitor live jobs across 14 Kerala districts.
                      </p>
                    </div>
                    <Link
                      href="/office-staff/dashboard"
                      className="px-4 py-2.5 rounded-xl bg-[#1B2CC1] hover:bg-[#15239E] text-white text-xs font-bold transition-all shadow-md shadow-[#1B2CC1]/25 shrink-0 text-center"
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
