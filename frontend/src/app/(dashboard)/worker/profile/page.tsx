'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { useWorker } from '@/context/worker-context';
import {
  WorkerNavbar,
  WorkerAvatarCropModal,
  WorkerAvailabilityModal,
  WorkerFullMapModal,
  WorkerMapSettingsModal,
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
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Briefcase,
  Camera,
  Check,
  ChevronRight,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  X,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export default function WorkerProfilePage() {
  const router = useRouter();
  const { user: authUser, token, isLoading: authLoading, logout, refreshUser } = useAuth();
  const { crewMembers, activeJob } = useWorker();
  const toast = useToast();

  // Modals for editing sections from the menu
  const [activeModal, setActiveModal] = useState<'none' | 'personal' | 'security' | 'attendance' | 'support' | 'settings'>('none');

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

  // Feedback State
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

  // Initial auth check & profile fetch & URL tab sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'security') {
        setActiveModal('security');
      } else if (tabParam === 'personal' || tabParam === 'profile') {
        setActiveModal('personal');
      } else if (tabParam === 'shift' || tabParam === 'attendance') {
        setActiveModal('attendance');
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

  // Real-time Live Username Availability Check
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
      setUsernameMessage('Letters, numbers, underscores only');
      return;
    }

    setUsernameStatus('checking');
    usernameDebounceRef.current = setTimeout(async () => {
      try {
        if (!token) return;
        const res = await workerProfileService.checkUsername(clean, token);
        if (res.isAvailable) {
          setUsernameStatus('available');
          setUsernameMessage('Username available');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage('Username already claimed');
        }
      } catch (e: any) {
        setUsernameStatus('idle');
        setUsernameMessage('');
      }
    }, 400);
  };

  // Save Profile Details
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
      setProfileSuccess(res.message || 'Profile updated successfully!');

      try {
        await refreshUser();
      } catch (syncErr) {
        console.warn('Failed to sync auth user context:', syncErr);
      }

      toast.success(
        'Profile Updated',
        'Your worker credentials and field status were saved.',
      );
      setTimeout(() => {
        setProfileSuccess('');
        setActiveModal('none');
      }, 1500);
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile details');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save Security / Password
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
      setTimeout(() => {
        setSecuritySuccess('');
        setActiveModal('none');
      }, 1500);
    } catch (err: any) {
      setSecurityError(err?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  // Toggle Duty Status
  const handleConfirmDutyChange = async (targetStatus: 'AVAILABLE' | 'OFF_DUTY') => {
    if (!token || togglingDuty) return;
    setTogglingDuty(true);
    try {
      await AttendanceService.updateStatus(targetStatus, token);
      setWorkerStatus(targetStatus);
      setIsAvailabilityModalOpen(false);

      if (targetStatus === 'AVAILABLE') {
        toast.success(
          'Available for Work',
          'You are now marked Available for new field dispatches.',
        );
      } else {
        toast.info(
          'On Leave / Off Duty',
          'You are now marked Off Duty.',
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

  // Efficiency percentage calculation
  const performanceScore = useMemo(() => {
    if (jobs.length === 0) return 92;
    const completedRatio = completedJobsCount / jobs.length;
    return Math.min(99, Math.max(85, Math.round(completedRatio * 100)));
  }, [jobs.length, completedJobsCount]);

  if (authLoading || isFetchingProfile) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-9 h-9 animate-spin text-[#0F8A5F] mb-3" />
        <p className="text-sm font-semibold tracking-wide">Loading Operative Profile...</p>
        <span className="text-xs text-slate-400 mt-1">Field Operative Account</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col items-center font-sans antialiased text-slate-800">
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

      {/* ========================================================
          MOBILE-FIRST PROFILE CONTAINER (Matching User Image Exactly)
      ======================================================== */}
      <div className="w-full max-w-md mx-auto pt-20 sm:pt-24 pb-28 px-4 flex flex-col gap-5">
        
        {/* Top Header: Avatar, Name, Email & Settings Gear */}
        <div className="flex items-center justify-between pt-2 px-1">
          <div className="flex items-center gap-4">
            {/* Avatar with tap to change */}
            <div className="relative group">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-md flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0C5E3F] to-[#0F8A5F] text-white text-xl font-bold">
                    {name?.charAt(0) || 'W'}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#0F8A5F] text-white flex items-center justify-center shadow-xs cursor-pointer hover:scale-110 transition-transform"
                title="Change Photo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            {/* Name & Contact */}
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                {name || 'Ayesha Khan'}
              </h1>
              <p className="text-xs text-slate-400 font-normal truncate max-w-[210px] mt-0.5">
                {email || (phone ? `+91 ${phone}` : `@${username}`)}
              </p>
            </div>
          </div>

          {/* Top-Right Settings Gear (Clean outlined like reference) */}
          <button
            type="button"
            onClick={() => setActiveModal('personal')}
            className="p-2 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            title="Settings & Edit Profile"
          >
            <Settings className="w-6 h-6 stroke-[1.8]" />
          </button>
        </div>

        {/* ========================================================
            FEATURED EMERALD PERFORMANCE CARD (Finora Health Card)
        ======================================================== */}
        <div className="relative overflow-hidden rounded-[26px] p-5 sm:p-6 bg-gradient-to-br from-[#024a35] via-[#04684b] to-[#0a8662] text-white shadow-[0_16px_36px_rgba(2,74,53,0.28)]">
          {/* Subtle background ambient mesh */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            {/* Left Content */}
            <div className="flex flex-col justify-between">
              <span className="text-[12px] font-medium text-emerald-100/90 tracking-wide">
                Your Work Performance
              </span>

              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[26px] font-bold text-white tracking-tight">
                  Excellent
                </span>
                <ArrowUpRight className="w-5 h-5 text-emerald-200 stroke-[2.5]" />
              </div>

              <p className="text-[12px] text-emerald-100/80 font-normal mt-1 leading-snug">
                Keep going! You&apos;re on the right track.
              </p>

              {/* Status Pill */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-emerald-100 w-fit">
                <span className={`w-1.5 h-1.5 rounded-full ${workerStatus === 'AVAILABLE' ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300'}`} />
                <span>{workerStatus === 'AVAILABLE' ? 'Ready for Dispatches' : workerStatus}</span>
              </div>
            </div>

            {/* Right: Circular Progress Ring (92%) */}
            <div className="relative shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 80 80">
                {/* Background Ring */}
                <circle
                  cx="40"
                  cy="40"
                  r="31"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="5.5"
                  fill="transparent"
                />
                {/* Progress Ring */}
                <circle
                  cx="40"
                  cy="40"
                  r="31"
                  stroke="#ffffff"
                  strokeWidth="5.5"
                  strokeDasharray={195}
                  strokeDashoffset={195 - (195 * performanceScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-bold text-white tracking-tight">
                  {performanceScore}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            ACTION & NAVIGATION LIST (Matching Reference Image)
        ======================================================== */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] divide-y divide-slate-100/90 overflow-hidden px-1">
          
          {/* 1. Personal Information */}
          <button
            type="button"
            onClick={() => setActiveModal('personal')}
            className="w-full flex items-center justify-between py-4 px-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3.5">
              <UserIcon className="w-5 h-5 text-slate-700 stroke-[1.8] group-hover:text-[#0F8A5F] transition-colors" />
              <span className="text-[14px] font-medium text-slate-800">
                Personal Information
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] group-hover:text-slate-600 transition-colors" />
          </button>

          {/* 2. Linked Accounts / Work Orders */}
          <button
            type="button"
            onClick={() => router.push('/worker/dashboard')}
            className="w-full flex items-center justify-between py-4 px-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3.5">
              <RefreshCw className="w-5 h-5 text-slate-700 stroke-[1.8] group-hover:text-[#0F8A5F] transition-colors" />
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-slate-800">
                  Linked Accounts
                </span>
                {assignedJobsCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#0F8A5F]/15 text-[#0F8A5F]">
                    {assignedJobsCount} jobs
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] group-hover:text-slate-600 transition-colors" />
          </button>

          {/* 3. Duty & Shift Attendance */}
          <button
            type="button"
            onClick={() => setActiveModal('attendance')}
            className="w-full flex items-center justify-between py-4 px-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3.5">
              <Clock className="w-5 h-5 text-slate-700 stroke-[1.8] group-hover:text-[#0F8A5F] transition-colors" />
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-slate-800">
                  Duty & Shift Status
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  workerStatus === 'AVAILABLE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {workerStatus}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] group-hover:text-slate-600 transition-colors" />
          </button>

          {/* 4. Security & Privacy */}
          <button
            type="button"
            onClick={() => setActiveModal('security')}
            className="w-full flex items-center justify-between py-4 px-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3.5">
              <ShieldCheck className="w-5 h-5 text-slate-700 stroke-[1.8] group-hover:text-[#0F8A5F] transition-colors" />
              <span className="text-[14px] font-medium text-slate-800">
                Security & Privacy
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] group-hover:text-slate-600 transition-colors" />
          </button>

          {/* 5. Notifications */}
          <button
            type="button"
            onClick={() => router.push('/worker/notifications')}
            className="w-full flex items-center justify-between py-4 px-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3.5">
              <Bell className="w-5 h-5 text-slate-700 stroke-[1.8] group-hover:text-[#0F8A5F] transition-colors" />
              <span className="text-[14px] font-medium text-slate-800">
                Notifications
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] group-hover:text-slate-600 transition-colors" />
          </button>

          {/* 6. Help & Support */}
          <button
            type="button"
            onClick={() => setActiveModal('support')}
            className="w-full flex items-center justify-between py-4 px-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3.5">
              <HelpCircle className="w-5 h-5 text-slate-700 stroke-[1.8] group-hover:text-[#0F8A5F] transition-colors" />
              <span className="text-[14px] font-medium text-slate-800">
                Help & Support
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] group-hover:text-slate-600 transition-colors" />
          </button>

          {/* 7. Settings / Map */}
          <button
            type="button"
            onClick={() => setActiveModal('personal')}
            className="w-full flex items-center justify-between py-4 px-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3.5">
              <Settings className="w-5 h-5 text-slate-700 stroke-[1.8] group-hover:text-[#0F8A5F] transition-colors" />
              <span className="text-[14px] font-medium text-slate-800">
                Settings
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] group-hover:text-slate-600 transition-colors" />
          </button>
        </div>

        {/* ========================================================
            LOG OUT PILL BUTTON (Matching Image Exactly)
        ======================================================== */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3.5 px-6 rounded-full bg-[#E5F7F0] hover:bg-[#D3F3E6] text-[#0F8A5F] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <RefreshCw className="w-4 h-4 stroke-[2.2]" />
            <span>Log Out →</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          MODAL 1: PERSONAL INFORMATION EDITING
      ======================================================== */}
      {activeModal === 'personal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 absolute right-4 top-4 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-[#0F8A5F]/10 text-[#0F8A5F] flex items-center justify-center">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Personal Information</h3>
                <p className="text-xs text-slate-400">Update your operative credentials</p>
              </div>
            </div>

            {profileSuccess && (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Karan Kumar"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F8A5F] focus:ring-2 focus:ring-[#0F8A5F]/20"
                />
              </div>

              {/* Username */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Username *</label>
                  {usernameStatus === 'checking' && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" /> Checking...
                    </span>
                  )}
                  {usernameStatus === 'available' && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> Available
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
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F8A5F] focus:ring-2 focus:ring-[#0F8A5F]/20"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9847123450"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F8A5F] focus:ring-2 focus:ring-[#0F8A5F]/20"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="worker@example.com"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F8A5F] focus:ring-2 focus:ring-[#0F8A5F]/20"
                />
              </div>

              {/* Status Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Field Presence Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkerStatus('AVAILABLE')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      workerStatus === 'AVAILABLE'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkerStatus('BUSY')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      workerStatus === 'BUSY'
                        ? 'bg-amber-50 border-amber-500 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Busy
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkerStatus('OFF_DUTY')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      workerStatus === 'OFF_DUTY'
                        ? 'bg-slate-100 border-slate-400 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Off Duty
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full py-3.5 rounded-full bg-[#0F8A5F] hover:bg-[#0C734F] text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: SECURITY & PASSWORD
      ======================================================== */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 absolute right-4 top-4 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-[#0F8A5F]/10 text-[#0F8A5F] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Security & Password</h3>
                <p className="text-xs text-slate-400">Manage operative login credentials</p>
              </div>
            </div>

            {securitySuccess && (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{securitySuccess}</span>
              </div>
            )}

            {securityError && (
              <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSecurity} className="mt-4 space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password *</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-4 pr-11 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F8A5F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password *</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, uppercase, lowercase, number, symbol"
                    className="w-full pl-4 pr-11 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F8A5F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F8A5F]"
                />
              </div>

              {/* Policy Check */}
              {newPassword && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-1.5 text-[11px]">
                  <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check className="w-3 h-3" /> 8+ Characters
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check className="w-3 h-3" /> Uppercase
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check className="w-3 h-3" /> Lowercase
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasNumber && hasSpecial ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check className="w-3 h-3" /> Number & Symbol
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingSecurity}
                className="w-full py-3.5 rounded-full bg-[#0F8A5F] hover:bg-[#0C734F] text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer mt-2"
              >
                {isSavingSecurity ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: SHIFT & ATTENDANCE SUMMARY
      ======================================================== */}
      {activeModal === 'attendance' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-slate-800">
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 absolute right-4 top-4 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-[#0F8A5F]/10 text-[#0F8A5F] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Duty & Shift Attendance</h3>
                <p className="text-xs text-slate-400">Daily field check-in status</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Presence</span>
                  <div className="text-sm font-black text-slate-900">{workerStatus}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('none');
                    setIsAvailabilityModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0F8A5F] hover:bg-[#0C734F] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Change Duty
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold">Assigned</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">{assignedJobsCount}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold">In Progress</div>
                  <div className="text-lg font-black text-amber-600 mt-0.5">{activeJobsCount}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold">Completed</div>
                  <div className="text-lg font-black text-emerald-600 mt-0.5">{completedJobsCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: HELP & SUPPORT DESK
      ======================================================== */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative text-slate-800 text-center">
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 absolute right-4 top-4 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#0F8A5F]/10 text-[#0F8A5F] flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900">KK Group Dispatch Desk</h3>
            <p className="text-xs text-slate-500 mt-1">
              Need assistance with work orders, machine dispatch, or field wages?
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-left text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Dispatch Helpline</span>
                <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">+91 98470 12345</div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Kerala Head Office</span>
                <div className="text-slate-700 mt-0.5">Thrissur Operations Center, Kerala</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="w-full mt-4 py-3 rounded-full bg-[#0F8A5F] hover:bg-[#0C734F] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              Close Support
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          EXISTING CORE WORKER MODALS (Retained & Fully Working)
      ======================================================== */}
      {/* Cloudinary Avatar Crop Modal */}
      {token && (
        <WorkerAvatarCropModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          onAvatarUpdated={(newUrl) => {
            setAvatar(newUrl);
            toast.success('Avatar Updated', 'Your profile portrait has been uploaded.');
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

      {/* Map Modals */}
      <WorkerFullMapModal
        activeJob={activeJob}
        operatives={crewMembers}
      />
      <WorkerMapSettingsModal />
    </div>
  );
}
