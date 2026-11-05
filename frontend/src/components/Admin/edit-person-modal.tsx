'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  AtSign,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { api, User, UpdatePersonData } from '@/services';
import { AdminDropdown, AdminDropdownOption } from './admin-dropdown';
import { useAdminTheme } from '@/context/admin-theme-context';

const ROLE_OPTIONS: AdminDropdownOption[] = [
  {
    value: 'WORKER',
    label: 'Worker (Field Operations)',
    badge: 'Field',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  },
  {
    value: 'OFFICE_STAFF',
    label: 'Office Staff (Coordinator)',
    badge: 'Office',
    badgeColor: 'bg-[#6366F1]/10 text-[#818CF8] border border-[#6366F1]/20',
  },
  {
    value: 'CUSTOMER',
    label: 'Customer (Client)',
    badge: 'Client',
    badgeColor: 'bg-[#FF5C38]/10 text-[#FF5C38] border border-[#FF5C38]/20',
  },
];

interface EditPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: User | null;
  token: string;
  onSuccess: (updatedPerson?: User) => void;
}

export function EditPersonModal({
  isOpen,
  onClose,
  person,
  token,
  onSuccess,
}: EditPersonModalProps) {
  const { isDark } = useAdminTheme();

  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'WORKER' | 'OFFICE_STAFF' | 'CUSTOMER'>('WORKER');
  const [isActive, setIsActive] = useState(true);
  const [workerStatus, setWorkerStatus] = useState<'AVAILABLE' | 'BUSY' | 'OFF_DUTY'>('AVAILABLE');
  const [staffStatus, setStaffStatus] = useState<'AVAILABLE' | 'OFF_DUTY'>('AVAILABLE');

  // Password reset section
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Real-time username check state
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'error'
  >('idle');
  const usernameDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize form when person changes or modal opens
  useEffect(() => {
    if (person && isOpen) {
      setName(person.name || '');
      setMobileNumber(person.phone || '');
      setEmail(person.email || '');
      setUsername(person.username || '');
      setRole((person.role as 'WORKER' | 'OFFICE_STAFF' | 'CUSTOMER') || 'WORKER');
      setIsActive(person.isActive ?? true);
      setWorkerStatus(person.workerStatus || 'AVAILABLE');
      setStaffStatus(person.staffStatus || 'AVAILABLE');
      setChangePassword(false);
      setNewPassword('');
      setShowPassword(false);
      setError('');
      setSuccessMessage('');
      setUsernameStatus('idle');
    }
  }, [person, isOpen]);

  // Debounced username check when changed from original
  useEffect(() => {
    if (!person) return;
    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }

    const clean = username.trim().toLowerCase();
    if (!clean || clean === person.username?.toLowerCase()) {
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
        const res = await api.checkUsername(clean, token);
        if (res.isAvailable) {
          setUsernameStatus('available');
        } else {
          setUsernameStatus('taken');
        }
      } catch {
        setUsernameStatus('error');
      }
    }, 400);

    return () => {
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current);
      }
    };
  }, [username, person, token]);

  if (!isOpen || !person) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name.trim()) {
      setError('Full name is required');
      return;
    }

    if (!mobileNumber.trim()) {
      setError('Mobile number is required');
      return;
    }

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('The selected username is already taken');
      return;
    }

    if (role === 'CUSTOMER' && !email.trim()) {
      setError('Email address is required for customer accounts');
      return;
    }

    if (changePassword) {
      if (!newPassword) {
        setError('Please enter a new password or uncheck reset password');
        return;
      }
      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      const hasUpper = /[A-Z]/.test(newPassword);
      const hasLower = /[a-z]/.test(newPassword);
      const hasNum = /[0-9]/.test(newPassword);
      const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
      if (!hasUpper || !hasLower || !hasNum || !hasSpecial) {
        setError(
          'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special symbol',
        );
        return;
      }
    }

    setIsLoading(true);

    try {
      const payload: UpdatePersonData = {
        name: name.trim(),
        mobileNumber: mobileNumber.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim() ? email.trim().toLowerCase() : undefined,
        role,
        isActive,
      };

      if (role === 'WORKER') {
        payload.workerStatus = workerStatus;
      } else if (role === 'OFFICE_STAFF') {
        payload.staffStatus = staffStatus;
      }

      if (changePassword && newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const res = await api.updatePerson(person.id, payload, token);
      setSuccessMessage('User details updated successfully');

      setTimeout(() => {
        onSuccess(res.person);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Update person error:', err);
      setError(err?.message || 'Failed to update user details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar rounded-[28px] border ${
          isDark ? 'bg-[#12141A] border-white/[0.08]' : 'bg-white border-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-5 border-b sticky top-0 z-10 ${
            isDark ? 'bg-[#161922] border-white/[0.06]' : 'bg-slate-50 border-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-[#FF5C38] ${
                isDark ? 'bg-[#181A20] border-white/[0.08]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Modify User Profile
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Editing credentials & settings for{' '}
                <span className="font-mono font-medium text-[#FF5C38]">@{person.username}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark
                ? 'text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
                : 'text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* User Profile Card Preview */}
          <div
            className={`flex items-center gap-3.5 p-4 rounded-2xl border ${
              isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5C38] to-[#FF8A65] p-[2px] shrink-0 shadow-sm">
              <div
                className={`w-full h-full rounded-[14px] flex items-center justify-center font-bold text-sm overflow-hidden ${
                  isDark ? 'bg-[#181A20] text-white' : 'bg-white text-slate-900'
                }`}
              >
                {person.avatar ? (
                  <img
                    src={person.avatar}
                    alt={person.name || person.username || 'Avatar'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                {!person.avatar && (
                  <span>
                    {(person.name || person.username || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {person.name || `@${person.username}`}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF5C38]/10 text-[#FF5C38] border border-[#FF5C38]/20 uppercase">
                  {person.role.replace('_', ' ')}
                </span>
              </div>
              <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                @{person.username} &bull; {person.phone || 'No phone'}
              </p>
            </div>
          </div>

          {/* Primary Identity Section */}
          <div className="space-y-4">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Profile & Contact Info
            </h3>

            {/* Name */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all border focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]/20 ${
                    isDark
                      ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Username & Check */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                Username
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  placeholder="e.g. rahul_s"
                  className={`w-full rounded-xl pl-10 pr-10 py-2.5 text-sm font-mono transition-all border focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]/20 ${
                    isDark
                      ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
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
                <p className="text-[11px] text-rose-400 mt-1">Username is already taken by another account.</p>
              )}
            </div>

            {/* Mobile & Email in grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono transition-all border focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]/20 ${
                      isDark
                        ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Email Address {role === 'CUSTOMER' ? '*' : '(Optional)'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@kkgroup.com"
                    className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all border focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]/20 ${
                      isDark
                        ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role & Status Section */}
          <div className={`space-y-4 pt-4 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Role & Account Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  System Role
                </label>
                <AdminDropdown
                  options={ROLE_OPTIONS}
                  value={role}
                  onChange={(val) => setRole(val as any)}
                  variant="coral"
                  size="md"
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Account Status
                </label>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    {isActive ? 'Account Active' : 'Account Suspended'}
                  </span>
                  <span className="text-xs opacity-75 font-semibold">Toggle</span>
                </button>
              </div>
            </div>

            {/* Operational status options if Worker or Staff */}
            {role === 'WORKER' && (
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Worker Availability Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['AVAILABLE', 'BUSY', 'OFF_DUTY'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setWorkerStatus(s)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        workerStatus === s
                          ? 'bg-[#FF5C38]/15 border-[#FF5C38] text-[#FF6B4A] font-semibold'
                          : isDark
                          ? 'bg-[#121318] border-white/[0.06] text-zinc-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {role === 'OFFICE_STAFF' && (
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Office Duty Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['AVAILABLE', 'OFF_DUTY'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStaffStatus(s)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        staffStatus === s
                          ? 'bg-[#FF5C38]/15 border-[#FF5C38] text-[#FF6B4A] font-semibold'
                          : isDark
                          ? 'bg-[#121318] border-white/[0.06] text-zinc-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Password Reset Section */}
          <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#FF5C38]" />
                <h3 className={`text-xs font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                  Reset User Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setChangePassword(!changePassword);
                  if (changePassword) setNewPassword('');
                }}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  changePassword
                    ? 'bg-[#FF5C38]/20 border-[#FF5C38] text-[#FF5C38] font-semibold'
                    : isDark
                    ? 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {changePassword ? 'Cancel Reset' : 'Change Password'}
              </button>
            </div>

            {changePassword && (
              <div
                className={`p-4 rounded-2xl border space-y-3 animate-in fade-in duration-150 ${
                  isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      className={`w-full rounded-xl pl-10 pr-10 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className={`text-[11px] mt-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Requires min 8 characters, uppercase, lowercase, number, and special symbol.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 text-xs font-semibold rounded-full transition-colors ${
                isDark
                  ? 'text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || usernameStatus === 'taken'}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#FF5C38] hover:bg-[#FF6B4A] rounded-full transition-all disabled:opacity-50 shadow-lg shadow-[#FF5C38]/25 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
