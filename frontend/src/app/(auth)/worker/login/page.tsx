'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api } from '@/services';
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  ShieldCheck,
  Check,
  HardHat,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function WorkerLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Landing intro state vs active login form state
  const [showLoginForm, setShowLoginForm] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('mode=login')) {
      setShowLoginForm(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await api.staffLogin({
        username: username.trim(),
        password,
        portalRole: 'WORKER',
      });

      if (res.token && res.user) {
        login(res.token, res.user);
        router.push('/worker/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Worker sign in failed. Please verify your credentials.',
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 font-sans antialiased bg-[#EBF3F8] selection:bg-[#0F8A5F] selection:text-white">

      {/* ========================================================
          VIEW 1: LANDING / ONBOARDING SCREEN
      ======================================================== */}
      {!showLoginForm ? (
        <div className="w-full max-w-[390px] min-h-[720px] rounded-[36px] bg-white border border-slate-200/80 shadow-[0_25px_70px_rgba(15,138,95,0.12)] flex flex-col justify-between p-6 sm:p-7 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Subtle soft gradient background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#E7F3FA] via-[#F6FAFD] to-white pointer-events-none" />

          {/* Logo & Headline */}
          <div className="relative z-10 pt-2 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#0F8A5F] flex items-center justify-center text-white shadow-sm">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>KK Field</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#0F8A5F]/10 text-[#0F8A5F]">
                  OPERATIVE
                </span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-[34px] font-black text-slate-900 tracking-tight leading-[1.18] mt-2">
              Take Control <br /> of Your Daily Work
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 leading-relaxed">
              Track coconut trees, log field hours, and reach your goals.
            </p>
          </div>

          {/* Center Hero Illustration */}
          <div className="relative z-10 my-auto py-2 flex items-center justify-center">
            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-lg border border-slate-200/60 bg-slate-100">
              <Image
                src="/images/worker-landing-hero.jpg"
                alt="Field Operative at Sunrise"
                fill
                priority
                sizes="(max-width: 400px) 100vw, 360px"
                className="object-cover object-top hover:scale-102 transition-transform duration-500"
              />
              {/* Soft overlay gradient at the bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#A3E5C7]" />
                  <span>Cococare & Field Squads</span>
                </span>
                <span className="text-[#A3E5C7]">Kerala</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="relative z-10 pt-4 pb-2 text-center">
            {/* Get Started Button */}
            <button
              type="button"
              onClick={() => setShowLoginForm(true)}
              className="w-full py-4 rounded-full bg-[#0F8A5F] hover:bg-[#0C734F] text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0F8A5F]/25 cursor-pointer active:scale-[0.99]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Already have an account? Sign In */}
            <p className="text-xs text-slate-500 font-medium mt-3.5">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setShowLoginForm(true)}
                className="text-[#0F8A5F] font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>

            {/* Switch to office staff */}
            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <Link
                href="/office-staff/login"
                className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
              >
                Office staff member? Switch to Office Sign In →
              </Link>
            </div>
          </div>
        </div>
      ) : (

        /* ========================================================
            VIEW 2: LOGIN FORM SCREEN (Unified Light & Green Palette)
        ======================================================== */
        <div className="w-full max-w-[390px] rounded-[36px] bg-white border border-slate-200/80 shadow-[0_25px_70px_rgba(15,138,95,0.12)] p-6 sm:p-7 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Subtle soft gradient background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#E7F3FA] via-[#F6FAFD] to-white pointer-events-none" />

          <div className="relative z-10">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between mb-5">
              <button
                type="button"
                onClick={() => setShowLoginForm(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer p-1"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-md bg-[#0F8A5F] flex items-center justify-center text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
                  </svg>
                </div>
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                  KK Field
                </span>
              </div>
            </div>

            {/* Worker Depiction Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F8A5F]/10 border border-[#0F8A5F]/20 text-[#0F8A5F] mb-3 shadow-xs">
              <HardHat className="w-3.5 h-3.5 text-[#0F8A5F]" />
              <span className="text-[11px] font-black uppercase tracking-wider">
                Field Worker Portal • ഫീൽഡ് വർക്കർ
              </span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-3xl sm:text-[34px] font-black text-slate-900 tracking-tight mb-2">
              Welcome back!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6">
              Pick up where you left off, and keep field operations moving.
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
              {/* Username Input */}
              <div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Worker username (e.g. worker_karan)"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F8A5F] focus:ring-2 focus:ring-[#0F8A5F]/20 transition-all shadow-xs"
                />
              </div>

              {/* Password with Show / Hide text toggle */}
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-5 pr-16 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F8A5F] focus:ring-2 focus:ring-[#0F8A5F]/20 transition-all shadow-xs tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer px-1 py-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Remember me & Forgot password row */}
              <div className="flex items-center justify-between pt-1 pb-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${
                      rememberMe
                        ? 'bg-[#0F8A5F] border-[#0F8A5F] text-white'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(true);
                    setForgotSent(false);
                    setForgotInput(username);
                  }}
                  className="text-xs font-bold text-[#0F8A5F] hover:underline transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Action Button: Log in → */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-full bg-[#0F8A5F] hover:bg-[#0C734F] text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#0F8A5F]/25 active:scale-[0.99] disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Log in →</span>
                )}
              </button>
            </form>

            {/* Subtle Switcher Link right under button */}
            <div className="mt-4 pt-3.5 text-center border-t border-slate-100">
              <Link
                href="/office-staff/login"
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-block"
              >
                Office staff member? <span className="text-[#0F8A5F] hover:underline font-bold">Switch to Office Sign In →</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FORGOT PASSWORD MODAL (Matching Light Clean Theme)
      ======================================================== */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative text-slate-800">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 absolute right-4 top-4 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <div className="w-12 h-12 rounded-2xl bg-[#0F8A5F]/10 border border-[#0F8A5F]/20 text-[#0F8A5F] flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Reset Worker Password
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your worker username to notify your dispatch coordinator.
              </p>
            </div>

            {forgotSent ? (
              <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-800">
                  Reset request logged!
                </p>
                <p className="text-[11px] text-slate-600">
                  Please contact your office dispatch coordinator or supervisor.
                </p>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="mt-2 text-xs font-bold text-[#0F8A5F] hover:underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Worker Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. worker_karan"
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#0F8A5F]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0F8A5F] hover:bg-[#0C734F] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
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
