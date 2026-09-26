'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import {
  workerProfileService,
  AttendanceService,
  EnquiryService,
  UpdateWorkerProfileData,
  ServiceEnquiry,
} from '@/services';
import {
  WorkerNavbar,
  WorkerAvatarCropModal,
  WorkerAvailabilityModal,
} from '@/components/Worker';
import {
  User as UserIcon,
  HardHat,
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
  MapPin,
  Clock,
  ArrowLeft,
  Briefcase,
  Camera,
  Activity,
  Check,
  Sparkles,
} from 'lucide-react';

export default function WorkerProfilePage() {
  const router = useRouter();
  const { user: authUser, token, isLoading: authLoading, logout, refreshUser } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'shift'>('profile');

  // Profile Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [workerStatus, setWorkerStatus] = useState<'AVAILABLE' | 'BUSY' | 'OFF_DUTY'>('AVAILABLE');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & Feedback State
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  // Attendance & Jobs Summary
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [jobs, setJobs] = useState<ServiceEnquiry[]>([]);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [togglingDuty, setTogglingDuty] = useState(false);

  // Username validation check
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const usernameDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial auth check & profile fetch & URL tab sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'security' || tabParam === 'shift' || tabParam === 'profile') {
        setActiveTab(tabParam);
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!token || (authUser?.role !== 'WORKER' && authUser?.role !== 'SUPER_ADMIN')) {
        router.push('/worker/login');
        return;
      }
      fetchProfile();
      fetchAttendance();
      fetchJobs();
    }
  }, [authLoading, token, authUser, router]);

  const fetchProfile = async () => {
    if (!token) return;
    setIsFetchingProfile(true);
    setProfileError('');
    try {
      const res = await workerProfileService.getProfile(token);
      if (res?.user) {
        setName(res.user.name || '');
        setUsername(res.user.username || '');
        setEmail(res.user.email || '');
        setPhone(res.user.phone || '');
        setAvatar(res.user.avatar || null);
        if (res.user.workerStatus) {
          setWorkerStatus(res.user.workerStatus);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch worker profile:', err);
      if (authUser) {
        setName(authUser.name || '');
        setUsername(authUser.username || '');
        setEmail(authUser.email || '');
        setPhone(authUser.phone || '');
        setAvatar(authUser.avatar || null);
        if (authUser.workerStatus) {
          setWorkerStatus(authUser.workerStatus);
        }
      }
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const fetchAttendance = async () => {
    if (!token) return;
    try {
      const res = await AttendanceService.getTodayAttendance(token);
      setTodayAttendance(res);
      if (res?.workerStatus) {
        setWorkerStatus(res.workerStatus);
      } else if (res?.isAvailable !== undefined) {
        setWorkerStatus(res.isAvailable ? 'AVAILABLE' : 'OFF_DUTY');
      }
    } catch (err) {
      console.error('Failed to fetch worker attendance:', err);
    }
  };

  const fetchJobs = async () => {
    if (!token) return;
    try {
      const res = await EnquiryService.getWorkerJobs(token);
      setJobs(res.jobs || []);
    } catch (err) {
      console.error('Failed to fetch worker jobs:', err);
    }
  };

  // 2. Real-time Live Username Availability Check
  const handleUsernameChange = (val: string) => {
    setUsername(val);
    setProfileError('');

    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }

    const clean = val.trim().toLowerCase();
    if (!clean) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    if (clean === (authUser?.username || '').toLowerCase()) {
      setUsernameStatus('available');
      setUsernameMessage('Current operative username');
      return;
    }

    if (clean.length < 3) {
      setUsernameStatus('taken');
      setUsernameMessage('At least 3 characters required');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(clean)) {
      setUsernameStatus('taken');
      setUsernameMessage('Only letters, numbers, underscores and dashes allowed');
      return;
    }

    setUsernameStatus('checking');
    usernameDebounceRef.current = setTimeout(async () => {
      try {
        if (!token) return;
        const res = await workerProfileService.checkUsername(clean, token);
        if (res.isAvailable) {
          setUsernameStatus('available');
          setUsernameMessage('Username is available');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage('Username already claimed by another operative');
        }
      } catch (e: any) {
        setUsernameStatus('idle');
        setUsernameMessage('');
      }
    }, 400);
  };

  // 3. Save Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!name.trim()) {
      setProfileError('Full name is required');
      return;
    }

    if (!username.trim()) {
      setProfileError('Username is required');
      return;
    }

    if (usernameStatus === 'taken') {
      setProfileError('Please choose an available username');
      return;
    }

    setIsSavingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const payload: UpdateWorkerProfileData = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        mobileNumber: phone.trim() || undefined,
        email: email.trim() ? email.trim().toLowerCase() : undefined,
        workerStatus,
        avatar: avatar || undefined,
      };

      const res = await workerProfileService.updateProfile(payload, token);
      setProfileSuccess(res.message || 'Worker profile updated successfully!');

      try {
        await refreshUser();
      } catch (syncErr) {
        console.warn('Failed to sync auth user context:', syncErr);
      }

      toast.success(
        'Profile Updated',
        'Your worker credentials and field status were updated successfully.',
      );
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile details');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 4. Save Security / Password
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!currentPassword) {
      setSecurityError('Current password is required');
      return;
    }

    if (newPassword.length < 8) {
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
      const payload: UpdateWorkerProfileData = {
        currentPassword,
        newPassword,
      };

      const res = await workerProfileService.updateProfile(payload, token);
      setSecuritySuccess(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password Updated', 'Your operative password has been securely updated.');
      setTimeout(() => setSecuritySuccess(''), 4000);
    } catch (err: any) {
      setSecurityError(err?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  // 5. Toggle Duty Status
  const handleConfirmDutyChange = async (targetStatus: 'AVAILABLE' | 'OFF_DUTY') => {
    if (!token || togglingDuty) return;
    setTogglingDuty(true);
    try {
      await AttendanceService.updateStatus(targetStatus, token);
      setWorkerStatus(targetStatus);
      setIsAvailabilityModalOpen(false);

      if (targetStatus === 'AVAILABLE') {
        toast.success(
          'ഡ്യൂട്ടി ലഭ്യമാണ് / Available for Work',
          'You are now marked Available for new field dispatches.',
        );
      } else {
        toast.info(
          'അവധിയാണ് / On Leave / Off Duty',
          'You are now marked Off Duty. No new dispatches will be assigned to you.',
        );
      }
      fetchAttendance();
    } catch (err: any) {
      toast.error('Duty Update Failed', err?.message || 'Could not update status');
    } finally {
      setTogglingDuty(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/worker/login');
  };

  // Password Policy Checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const completedJobsCount = jobs.filter((j) => j.status === 'COMPLETED').length;
  const activeJobsCount = jobs.filter((j) => j.status === 'IN_PROGRESS').length;
  const assignedJobsCount = jobs.filter((j) => j.status === 'ASSIGNED').length;

  if (authLoading || isFetchingProfile) {
    return (
      <div className="min-h-screen bg-[#ECEFF6] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-9 h-9 animate-spin text-[#5E42B4] mb-3" />
        <p className="text-sm font-semibold tracking-wide">Loading Operative Profile...</p>
        <span className="text-xs text-slate-400 mt-1">തൊഴിലാളി വിവരങ്ങൾ • കേരള ഫീൽഡ് സ്ക്വാഡ്</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E5E8F2] pt-24 sm:pt-28 px-3 sm:px-6 lg:px-8 pb-28 md:pb-12 flex flex-col items-center gap-6 font-sans antialiased text-slate-800">
      {/* 1. TOP NAVBAR */}
      <WorkerNavbar
        activeTab="profile"
        onTabChange={(tab) => {
          if (tab === 'home' || tab === 'tasks' || tab === 'notifications' || tab === 'crew' || tab === 'analytics') {
            router.push('/worker/dashboard');
          }
        }}
        onLogout={handleLogout}
        hasNotifications={assignedJobsCount > 0}
        assignedJobsCount={assignedJobsCount}
        isOnDuty={workerStatus === 'AVAILABLE'}
        onToggleDuty={() => setIsAvailabilityModalOpen(true)}
        isTogglingDuty={togglingDuty}
        userName={name || authUser?.name || authUser?.username || 'Operative'}
        userAvatar={avatar || authUser?.avatar}
        userHandle={username || authUser?.username || undefined}
        userRole={authUser?.role || 'WORKER'}
      />

      {/* 2. MAIN PROFILE CONTAINER */}
      <div className="w-full max-w-[1380px] space-y-6">
        {/* Breadcrumb & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/worker/dashboard"
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all text-xs font-bold border border-slate-300/60"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Operative Profile & Credentials
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#5E42B4]/15 text-[#5E42B4] border border-[#5E42B4]/30">
                  WORKER
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                തൊഴിലാളി പ്രൊഫൈൽ • Kerala Field Squad
              </span>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#5E42B4] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Profile Details</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-[#5E42B4] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Security</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shift')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'shift'
                  ? 'bg-[#5E42B4] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Shift & Status</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            3. TAB CONTENT
        ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: Profile / Security / Shift Active View */}
          <div className="lg:col-span-2 space-y-6">
            {/* TAB 1: PROFILE DETAILS */}
            {activeTab === 'profile' && (
              <form
                onSubmit={handleSaveProfile}
                className="bg-[#ECEFF6] rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.06)] border border-white/80 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                  <div>
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <HardHat className="w-5 h-5 text-[#5E42B4]" />
                      <span>Field Identity & Contact</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your identity as presented on job dispatch sheets and customer confirmations
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#5E42B4] bg-[#5E42B4]/10 px-2.5 py-1 rounded-xl">
                    @{username || 'operative'}
                  </span>
                </div>

                {profileSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{profileError}</span>
                  </div>
                )}

                {/* Avatar Banner & Cloudinary Crop Trigger */}
                <div className="p-5 rounded-3xl bg-white/90 border border-slate-200/90 flex flex-wrap sm:flex-nowrap items-center gap-5 shadow-xs">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 border-4 border-white shadow-md flex items-center justify-center">
                      {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <HardHat className="w-10 h-10 text-slate-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                    >
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span>Change</span>
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-slate-900 truncate">
                      {name || 'Operative Member'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload your picture via Cloudinary image service. Square portrait recommended.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#5E42B4] hover:bg-[#4E34A0] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Update Portrait</span>
                      </button>
                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar(null)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Karan Kumar"
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E42B4]/20 focus:border-[#5E42B4] transition-all"
                    />
                  </div>

                  {/* Username with Live Check */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Username *</label>
                      {usernameStatus === 'checking' && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          <span>Checking...</span>
                        </span>
                      )}
                      {usernameStatus === 'available' && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Available</span>
                        </span>
                      )}
                      {usernameStatus === 'taken' && (
                        <span className="text-[10px] text-rose-500 font-bold">Unavailable</span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400 text-xs font-bold">@</span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="worker_handle"
                        className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E42B4]/20 focus:border-[#5E42B4] transition-all"
                      />
                    </div>
                    {usernameMessage && (
                      <p
                        className={`text-[10px] ${
                          usernameStatus === 'available'
                            ? 'text-emerald-600'
                            : usernameStatus === 'taken'
                            ? 'text-rose-500'
                            : 'text-slate-400'
                        }`}
                      >
                        {usernameMessage}
                      </p>
                    )}
                  </div>

                  {/* Mobile Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Mobile Phone</label>
                    <div className="relative flex items-center">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9847123450"
                        className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E42B4]/20 focus:border-[#5E42B4] transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="worker@example.com"
                        className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E42B4]/20 focus:border-[#5E42B4] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Worker Status Picker */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700">
                    Field Availability Status
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setWorkerStatus('AVAILABLE')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        workerStatus === 'AVAILABLE'
                          ? 'bg-emerald-50 border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>AVAILABLE</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        ലഭ്യമാണ് • Ready for task dispatch
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWorkerStatus('BUSY')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        workerStatus === 'BUSY'
                          ? 'bg-amber-50 border-amber-500/80 ring-2 ring-amber-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span>BUSY</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        ജോലിയിലാണ് • Active on field order
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWorkerStatus('OFF_DUTY')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        workerStatus === 'OFF_DUTY'
                          ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                        <span>OFF DUTY</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        അവധിയാണ് • Off duty / leave
                      </p>
                    </button>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#5E42B4] hover:bg-[#4E34A0] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Profile Details</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: SECURITY & PASSWORD */}
            {activeTab === 'security' && (
              <form
                onSubmit={handleSaveSecurity}
                className="bg-[#ECEFF6] rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.06)] border border-white/80 space-y-6"
              >
                <div className="border-b border-slate-200/80 pb-4">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#5E42B4]" />
                    <span>Password & Account Security</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your operative login credentials. Strong passwords protect field data.
                  </p>
                </div>

                {securitySuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{securitySuccess}</span>
                  </div>
                )}

                {securityError && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{securityError}</span>
                  </div>
                )}

                <div className="space-y-4 max-w-lg">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Current Password *</label>
                    <div className="relative flex items-center">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-white border border-slate-200/90 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E42B4]/20 focus:border-[#5E42B4] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">New Password *</label>
                    <div className="relative flex items-center">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 chars with uppercase, lowercase, number, special"
                        className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-white border border-slate-200/90 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E42B4]/20 focus:border-[#5E42B4] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Policy checklist */}
                    {newPassword && (
                      <div className="p-3 bg-white/80 rounded-2xl border border-slate-200 grid grid-cols-2 gap-1.5 text-[11px]">
                        <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                          <Check className="w-3 h-3" /> 8+ Characters
                        </span>
                        <span className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                          <Check className="w-3 h-3" /> Uppercase Letter
                        </span>
                        <span className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                          <Check className="w-3 h-3" /> Lowercase Letter
                        </span>
                        <span className={`flex items-center gap-1.5 ${hasNumber && hasSpecial ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                          <Check className="w-3 h-3" /> Number & Special
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E42B4]/20 focus:border-[#5E42B4] transition-all"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-[11px] text-rose-500 font-semibold">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={isSavingSecurity}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#5E42B4] hover:bg-[#4E34A0] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingSecurity ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: SHIFT & FIELD STATUS */}
            {activeTab === 'shift' && (
              <div className="bg-[#ECEFF6] rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.06)] border border-white/80 space-y-6">
                <div className="border-b border-slate-200/80 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#5E42B4]" />
                      <span>Shift Attendance & Dispatch Status</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daily field presence logged in the master payroll and dispatch ledger
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchAttendance}
                    className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 transition-colors shadow-xs"
                    title="Refresh Status"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Duty Toggle Hero Card */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-inner ${
                        workerStatus === 'AVAILABLE'
                          ? 'bg-emerald-500 shadow-emerald-500/30'
                          : workerStatus === 'BUSY'
                          ? 'bg-amber-500 shadow-amber-500/30'
                          : 'bg-slate-400 shadow-slate-400/30'
                      }`}
                    >
                      <Activity className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Current Field Presence
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-0.5">
                        {workerStatus === 'AVAILABLE'
                          ? 'Available for Dispatches (ലഭ്യമാണ്)'
                          : workerStatus === 'BUSY'
                          ? 'On Active Assignment (ജോലിയിലാണ്)'
                          : 'Off Duty / On Leave (അവധിയാണ്)'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Checked in via Kerala Operations Desk • {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAvailabilityModalOpen(true)}
                    className="px-5 py-2.5 rounded-2xl bg-[#5E42B4] hover:bg-[#4E34A0] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Change Duty Status</span>
                  </button>
                </div>

                {/* Assigned Work Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500">ASSIGNED JOBS</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">{assignedJobsCount}</div>
                    <span className="text-[10px] text-purple-600 font-semibold mt-1 block">Awaiting start</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500">IN PROGRESS</span>
                    <div className="text-2xl font-black text-amber-600 mt-1">{activeJobsCount}</div>
                    <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Active on site</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500">COMPLETED JOBS</span>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{completedJobsCount}</div>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Signed off</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 1 COLUMN: Operative Quick Bento Summary */}
          <div className="space-y-6">
            {/* Field ID Badge Card */}
            <div className="bg-[#ECEFF6] rounded-[32px] sm:rounded-[40px] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.06)] border border-white/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Field ID Badge
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              <div className="flex flex-col items-center text-center p-3">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 border-4 border-white shadow-md mb-3">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#5E42B4] text-white text-xl font-bold">
                      {name.charAt(0) || 'W'}
                    </div>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-900">{name || 'Operative'}</h3>
                <span className="text-xs text-[#5E42B4] font-bold font-mono">@{username}</span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 mt-2 shadow-xs">
                  Kerala Squad Operative
                </span>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-200/80 pt-3">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Field Status</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                      workerStatus === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : workerStatus === 'BUSY'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {workerStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-semibold text-slate-800">{phone || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">{email || 'Not set'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-[#ECEFF6] rounded-[32px] sm:rounded-[40px] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.06)] border border-white/80 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Quick Shortcuts
              </span>

              <button
                type="button"
                onClick={() => router.push('/worker/dashboard')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 transition-colors border border-slate-200/80 text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-[#5E42B4]" />
                  <span>View All Work Orders</span>
                </div>
                <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600">
                  {jobs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsAvailabilityModalOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 transition-colors border border-slate-200/80 text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Toggle Duty Status</span>
                </div>
                <span className="text-[11px] text-slate-400">Modal</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors border border-rose-200/80 text-xs font-bold cursor-pointer"
              >
                <Lock className="w-4 h-4 text-rose-600" />
                <span>Sign Out of Operative Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MODALS
      ======================================================== */}
      {/* Cloudinary Avatar Crop Modal */}
      {token && (
        <WorkerAvatarCropModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          onAvatarUpdated={(newUrl) => {
            setAvatar(newUrl);
            toast.success('Avatar Updated', 'Your profile portrait has been uploaded to Cloudinary.');
          }}
          token={token}
          currentAvatar={avatar}
          userName={name || 'Operative'}
        />
      )}

      {/* Duty Availability Modal */}
      <WorkerAvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        onConfirm={handleConfirmDutyChange}
        isLoading={togglingDuty}
        userName={name || authUser?.name || 'Operative'}
        currentStatus={workerStatus === 'AVAILABLE' ? 'AVAILABLE' : 'OFF_DUTY'}
      />
    </div>
  );
}
