'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api, User, UpdateAdminProfileData } from '@/services';
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
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { token, user: authUser, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

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

  // Initial load
  useEffect(() => {
    if (!authLoading) {
      if (!token || authUser?.role !== 'SUPER_ADMIN') {
        router.push('/admin/login');
        return;
      }
      fetchAdminProfile();
    }
  }, [authLoading, token, authUser, router]);

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

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-14">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <span>KK Group</span>
            <span>•</span>
            <span className="text-[#7B4DFF]">Super Admin Center</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-100 tracking-tight flex items-center gap-3">
            <span>Admin Profile & Settings</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7B4DFF]/15 text-[#A78BFA] border border-[#7B4DFF]/30">
              Root Authority
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your administrator credentials, security keys, contact details, and platform controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminProfile}
            disabled={isFetchingProfile}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#7B4DFF] ${isFetchingProfile ? 'animate-spin' : ''}`} />
            <span>Sync Profile</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Ribbon */}
      <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7B4DFF] to-indigo-600 p-[2px] shadow-lg shadow-[#7B4DFF]/20">
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
                <Shield className="w-3.5 h-3.5 text-[#7B4DFF]" />
                Full Privilege
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5 text-gray-400" />
                Edge Session Verified
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill */}
        <div className="flex items-center gap-1 bg-[#1A1C23] p-1.5 rounded-xl border border-gray-800 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all flex-1 md:flex-initial ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all flex-1 md:flex-initial ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all flex-1 md:flex-initial ${
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
      {isFetchingProfile ? (
        <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#7B4DFF] mb-3" />
          <p className="text-gray-400 text-sm">Loading admin credentials and security status...</p>
        </div>
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
