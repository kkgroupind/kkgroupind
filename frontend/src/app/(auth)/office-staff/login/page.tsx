'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api } from '@/services';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export default function OfficeStaffLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await api.staffLogin({
        username: username.trim(),
        password,
        portalRole: 'OFFICE_STAFF',
      });

      if (res.token && res.user) {
        login(res.token, res.user);
        router.push('/office-staff/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Office Staff sign in failed. Please check your credentials.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans antialiased selection:bg-[#94d436] selection:text-slate-900">
      {/* Centered Login Card exactly matching the reference design */}
      <div className="w-full max-w-[380px] flex flex-col items-center">
        
        {/* Top Brand Logo matching Image 2 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#94d436] flex items-center justify-center text-white shadow-xs">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 9h-3v3h-2v-3H6V9h3V6h2v3h3v2z" />
            </svg>
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
            kkgroup
          </span>
        </div>

        {/* Office Staff Depiction Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4fae8] border border-[#d2f09a] text-[#558d19] mb-3">
          <Building2 className="w-3.5 h-3.5 text-[#6fad22]" />
          <span className="text-[11px] font-black uppercase tracking-wider">
            Office Staff Portal • ഓഫീസ് സ്റ്റാഫ്
          </span>
        </div>

        {/* Large Bold Title */}
        <h1 className="text-3xl sm:text-[34px] font-black text-slate-900 text-center tracking-tight mb-2">
          Sign in
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 text-center mb-7 font-normal">
          Operations, squad dispatch & accounts desk
        </p>

        {/* Error Banner */}
        {errorMessage && (
          <div className="w-full mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Email / Username Input */}
          <div>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Staff username (e.g. staff_athira)"
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#94d436] focus:ring-2 focus:ring-[#94d436]/20 transition-all shadow-xs"
            />
          </div>

          {/* Password Input with eye icon */}
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white border border-slate-200 rounded-2xl pl-5 pr-12 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#94d436] focus:ring-2 focus:ring-[#94d436]/20 transition-all shadow-xs tracking-wide"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Forgot password row */}
          <div className="flex justify-end pt-0.5 pb-1">
            <button
              type="button"
              onClick={() => {
                setIsForgotModalOpen(true);
                setForgotSent(false);
                setForgotInput(username);
              }}
              className="text-xs font-semibold text-[#6fad22] hover:text-[#5b911a] hover:underline transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-[#94d436] hover:bg-[#84c32b] text-slate-950 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        {/* Subtle Switcher Link at Bottom */}
        <div className="w-full mt-4 pt-3.5 text-center border-t border-slate-100">
          <Link
            href="/worker/login"
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-block"
          >
            Are you a field operative? <span className="text-[#6fad22] hover:underline font-semibold">Switch to Worker Sign In →</span>
          </Link>
        </div>
      </div>

      {/* ========================================================
          FORGOT PASSWORD MODAL (Matching Light Clean Theme)
      ======================================================== */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative text-slate-800">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 absolute right-4 top-4 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <div className="w-12 h-12 rounded-2xl bg-[#94d436]/15 border border-[#94d436]/30 text-[#6fad22] flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Reset Staff Password
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your staff username to request password reset from the administrator.
              </p>
            </div>

            {forgotSent ? (
              <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="text-xs font-semibold text-emerald-800">
                  Reset request logged!
                </p>
                <p className="text-[11px] text-slate-600">
                  Please contact the administrator or executive office.
                </p>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="mt-2 text-xs font-bold text-[#6fad22] underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Staff Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. staff_athira"
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#94d436]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#94d436] hover:bg-[#84c32b] text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Send Reset Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
