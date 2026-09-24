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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#14151A] border border-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#1A1C23] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7B4DFF]/10 border border-[#7B4DFF]/20 flex items-center justify-center text-[#7B4DFF]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-100">
                Modify User Profile
              </h2>
              <p className="text-xs text-gray-400">
                Editing credentials & settings for{' '}
                <span className="font-mono text-gray-200">@{person.username}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Primary Identity Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Profile & Contact Info
            </h3>

            {/* Name */}
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
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF] focus:ring-1 focus:ring-[#7B4DFF] transition-all"
                  required
                />
              </div>
            </div>

            {/* Username & Check */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  placeholder="e.g. rahul_s"
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-10 pr-10 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF] focus:ring-1 focus:ring-[#7B4DFF] font-mono transition-all"
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
                <p className="text-[11px] text-red-400 mt-1">Username is already taken by another account.</p>
              )}
            </div>

            {/* Mobile & Email in grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF] focus:ring-1 focus:ring-[#7B4DFF] transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Email Address {role === 'CUSTOMER' ? '*' : '(Optional)'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@kkgroup.com"
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF] focus:ring-1 focus:ring-[#7B4DFF] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role & Status Section */}
          <div className="space-y-4 pt-3 border-t border-gray-800/80">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Role & Account Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-gray-100 focus:outline-none focus:border-[#7B4DFF] transition-all"
                >
                  <option value="WORKER">Worker (Field Operations)</option>
                  <option value="OFFICE_STAFF">Office Staff (Coordinator)</option>
                  <option value="CUSTOMER">Customer (Client)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Account Status
                </label>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {isActive ? 'Account Active' : 'Account Suspended'}
                  </span>
                  <span className="text-xs opacity-75 underline">Toggle</span>
                </button>
              </div>
            </div>

            {/* Operational status options if Worker or Staff */}
            {role === 'WORKER' && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Worker Availability Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['AVAILABLE', 'BUSY', 'OFF_DUTY'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setWorkerStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        workerStatus === s
                          ? 'bg-[#7B4DFF]/20 border-[#7B4DFF] text-white'
                          : 'bg-[#1A1C23] border-gray-800 text-gray-400 hover:text-gray-200'
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
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Office Duty Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['AVAILABLE', 'OFF_DUTY'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStaffStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        staffStatus === s
                          ? 'bg-[#7B4DFF]/20 border-[#7B4DFF] text-white'
                          : 'bg-[#1A1C23] border-gray-800 text-gray-400 hover:text-gray-200'
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
          <div className="space-y-3 pt-3 border-t border-gray-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#7B4DFF]" />
                <h3 className="text-xs font-semibold text-gray-200">
                  Reset User Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setChangePassword(!changePassword);
                  if (changePassword) setNewPassword('');
                }}
                className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                  changePassword
                    ? 'bg-[#7B4DFF]/20 border-[#7B4DFF] text-white'
                    : 'bg-[#1A1C23] border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {changePassword ? 'Cancel Reset' : 'Change Password'}
              </button>
            </div>

            {changePassword && (
              <div className="p-4 bg-[#1A1C23] rounded-xl border border-gray-800 space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      className="w-full bg-[#14151A] border border-gray-700/60 rounded-xl pl-10 pr-10 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    Requires min 8 characters, uppercase, lowercase, number, and special symbol.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-[#1A1C23] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || usernameStatus === 'taken'}
              className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-[#7B4DFF] hover:bg-[#683bdf] rounded-xl transition-all disabled:opacity-50 shadow-md shadow-[#7B4DFF]/20"
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
