'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Calendar,
  Shield,
  Mail,
  Phone,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Laptop,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Users,
  Building,
  Sparkles,
  Award,
  Clock,
  TrendingUp,
  MoreVertical,
  CheckSquare,
  Square,
  Pencil,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { api, User } from '@/services';
import { EditPersonModal } from './edit-person-modal';

interface PersonDetailViewProps {
  username: string;
  expectedRole: 'CUSTOMER' | 'WORKER' | 'OFFICE_STAFF';
  backHref: string;
  categoryLabel: string;
}

export function PersonDetailView({
  username,
  expectedRole,
  backHref,
  categoryLabel,
}: PersonDetailViewProps) {
  const { token, user: currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [person, setPerson] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Time Tracker State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(9300); // 02:35:00 default
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calendar Day Selection State
  const [selectedDay, setSelectedDay] = useState(24);

  // Accordion open state
  const [openAccordion, setOpenAccordion] = useState<string | null>('devices');

  // Interactive Onboarding Tasks State
  const [tasks, setTasks] = useState([
    {
      id: 't1',
      title: 'Welcome Kit & Access Credentials',
      date: 'Sep 12, 09:30',
      completed: true,
      icon: Briefcase,
    },
    {
      id: 't2',
      title: 'Team Introduction & Facility Tour',
      date: 'Sep 13, 10:30',
      completed: true,
      icon: Users,
    },
    {
      id: 't3',
      title: 'Project Assignment & Safety Briefing',
      date: 'Sep 14, 12:00',
      completed: false,
      icon: Shield,
    },
    {
      id: 't4',
      title: 'Review Operational KPIs & Goals',
      date: 'Sep 15, 14:45',
      completed: false,
      icon: TrendingUp,
    },
    {
      id: 't5',
      title: 'HR Compliance & Legal Documentation',
      date: 'Sep 16, 16:00',
      completed: false,
      icon: Award,
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  // Timer Tick Effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}${hrs < 10 ? `:${secs.toString().padStart(2, '0')}` : ''}`;
  };

  const fetchPerson = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPersonByUsername(username, token);
      setPerson(data);
    } catch (err: any) {
      console.error('Failed to fetch person details', err);
      setError(err?.message || 'User not found or unable to load details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [username, token]);

  useEffect(() => {
    if (!authLoading) {
      if (!token || currentUser?.role !== 'SUPER_ADMIN') {
        router.push('/admin/login');
        return;
      }
      fetchPerson();
    }
  }, [authLoading, token, currentUser, router, fetchPerson]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPerson();
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDelete = async () => {
    if (!person || !token) return;
    if (
      !confirm(
        `Are you sure you want to delete ${person.name || person.username}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.deletePerson(person.id, token);
      router.push(backHref);
    } catch (err: any) {
      console.error('Failed to delete user', err);
      alert(err?.message || 'Failed to delete user');
      setIsDeleting(false);
    }
  };

  const toggleAccordion = (name: string) => {
    setOpenAccordion((prev) => (prev === name ? null : name));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'WORKER':
        return {
          title: 'Field Operations Specialist',
          tag: 'Worker Staff',
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          salary: '₹45,000 / mo',
          device: 'Rugged Handheld Scanner Pro',
          version: 'Firmware v2.4',
        };
      case 'OFFICE_STAFF':
        return {
          title: 'Senior HR & Operations Desk',
          tag: 'Office Staff',
          badgeClass: 'bg-[#7B4DFF]/10 text-[#A78BFA] border-[#7B4DFF]/20',
          salary: '₹95,000 / mo',
          device: 'MacBook Air M2 15-inch',
          version: 'macOS Sequoia v15.1',
        };
      case 'CUSTOMER':
      default:
        return {
          title: 'Verified Premium Customer',
          tag: 'Customer Account',
          badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          salary: 'Tier: Gold Member',
          device: 'Authorized Mobile App Session',
          version: 'iOS App v4.12',
        };
    }
  };

  if (authLoading || (isLoading && !person)) {
    return (
      <div className="max-w-[1550px] mx-auto space-y-6 pb-12 animate-pulse">
        <div className="h-10 w-48 bg-[#14151A] rounded-xl border border-gray-800" />
        <div className="h-28 bg-[#14151A] rounded-3xl border border-gray-800" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 h-[600px] bg-[#14151A] rounded-3xl border border-gray-800" />
          <div className="lg:col-span-6 h-[600px] bg-[#14151A] rounded-3xl border border-gray-800" />
          <div className="lg:col-span-3 h-[600px] bg-[#14151A] rounded-3xl border border-gray-800" />
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="max-w-[1100px] mx-auto space-y-6 pb-12">
        <NextLink
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {categoryLabel}
        </NextLink>

        <div className="bg-[#14151A] rounded-3xl border border-gray-800 p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-100 mb-2">User Not Found</h2>
          <p className="text-gray-500 text-sm max-w-md mb-6">
            {error || `The user @${username} does not exist or has been removed.`}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-[#1A1C23] hover:bg-gray-800 text-gray-300 rounded-xl border border-gray-800 text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <NextLink
              href={backHref}
              className="px-4 py-2 bg-[#7B4DFF] hover:bg-[#6A3DEE] text-white rounded-xl text-sm font-medium transition-colors"
            >
              Return to {categoryLabel}
            </NextLink>
          </div>
        </div>
      </div>
    );
  }

  const roleMeta = getRoleBadge(person.role);
  const displayName = person.name || person.username || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-14">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <NextLink
            href={backHref}
            className="p-2.5 rounded-2xl bg-[#14151A] hover:bg-[#1A1C23] text-gray-400 hover:text-white border border-gray-800 transition-all shadow-sm"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </NextLink>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <NextLink href="/admin/dashboard" className="hover:text-gray-300 transition-colors">
                Admin
              </NextLink>
              <span>/</span>
              <NextLink href={backHref} className="hover:text-gray-300 transition-colors">
                {categoryLabel}
              </NextLink>
              <span>/</span>
              <span className="text-[#A78BFA] font-mono">@{person.username}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-100 tracking-tight flex items-center gap-2.5 mt-0.5">
              <span>Welcome in, {displayName}</span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${roleMeta.badgeClass}`}>
                {roleMeta.tag}
              </span>
            </h1>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#7B4DFF]/15 hover:bg-[#7B4DFF]/25 border border-[#7B4DFF]/30 text-[#A78BFA] hover:text-white rounded-xl text-xs font-medium transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Modify Account</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#7B4DFF] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-medium transition-all disabled:opacity-50 ml-auto md:ml-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Removing...' : 'Delete Profile'}</span>
          </button>
        </div>
      </div>

      {/* Top Quick Status Ribbon (Matching Peoplexio Header Meters) */}
      <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Left: Progress Metres */}
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Interviews / Tasks
              </div>
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-[#7B4DFF] text-white text-xs font-bold shadow-[0_0_12px_rgba(123,77,255,0.35)]">
                18%
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Completed
              </div>
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-[#6A3DEE]/60 text-purple-200 border border-[#7B4DFF]/40 text-xs font-bold">
                24%
              </div>
            </div>

            <div className="min-w-[180px]">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                <span>Shift Progress</span>
                <span className="text-[#A78BFA]">65%</span>
              </div>
              <div className="w-full h-3 bg-[#1A1C23] rounded-full overflow-hidden border border-gray-800 p-0.5">
                <div className="h-full bg-gradient-to-r from-[#7B4DFF] to-indigo-500 rounded-full w-[65%]" />
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                System Health
              </div>
              <div className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-[#1A1C23] border border-gray-800 text-emerald-400 text-xs font-bold">
                98% Optimal
              </div>
            </div>
          </div>

          {/* Right: KPI Badges */}
          <div className="flex items-center gap-4 border-t lg:border-t-0 lg:border-l border-gray-800/80 pt-4 lg:pt-0 lg:pl-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1A1C23] border border-gray-800 flex items-center justify-center text-[#7B4DFF]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-100">128</div>
                <div className="text-[11px] text-gray-400 font-medium">Team Members</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1A1C23] border border-gray-800 flex items-center justify-center text-sky-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-100">36</div>
                <div className="text-[11px] text-gray-400 font-medium">Assigned Shifts</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1A1C23] border border-gray-800 flex items-center justify-center text-amber-400">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-100">54</div>
                <div className="text-[11px] text-gray-400 font-medium">Operational Hubs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Dashboard Layout (Matching Peoplexio UI Structure) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Profile Card & Collapsible Drawers (span 3)                   */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Profile Hero Card */}
          <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 overflow-hidden shadow-lg relative group">
            {/* Top decorative gradient banner */}
            <div className="h-32 bg-gradient-to-br from-[#7B4DFF]/30 via-indigo-900/20 to-transparent relative p-4 flex justify-between items-start">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-gray-300 border border-white/10">
                KK Group ID
              </span>
              <span
                className={`w-3 h-3 rounded-full border-2 border-[#14151A] ${
                  person.isActive ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
                title={person.isActive ? 'Active' : 'Inactive'}
              />
            </div>

            <div className="px-5 pb-5 -mt-16 relative">
              {/* Avatar */}
              <div className="relative inline-block mb-3">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#7B4DFF] to-sky-500 p-[3px] shadow-[0_8px_20px_rgba(123,77,255,0.3)]">
                  <div className="w-full h-full bg-[#1A1C23] rounded-[21px] flex items-center justify-center text-3xl font-extrabold text-white overflow-hidden">
                    {person.avatar ? (
                      <img
                        src={person.avatar}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    {(!person.avatar) && <span>{initial}</span>}
                  </div>
                </div>
              </div>

              {/* Names & Role */}
              <h2 className="text-xl font-bold text-gray-100 tracking-tight leading-snug">
                {displayName}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">{roleMeta.title}</p>
              <p className="text-xs text-[#A78BFA] font-mono mt-1">@{person.username}</p>

              {/* Salary / Value Pill */}
              <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-[#7B4DFF]/20 to-purple-900/20 border border-[#7B4DFF]/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Compensation / Tier
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">{roleMeta.salary}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#7B4DFF] text-white shadow-md">
                  <Award className="w-4 h-4" />
                </div>
              </div>

              {/* Contact Snapshot */}
              <div className="mt-4 space-y-2 text-xs">
                {person.email && (
                  <div className="flex items-center gap-2.5 text-gray-300 bg-[#1A1C23] p-2.5 rounded-xl border border-gray-800/60">
                    <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="truncate">{person.email}</span>
                  </div>
                )}
                {person.phone && (
                  <div className="flex items-center gap-2.5 text-gray-300 bg-[#1A1C23] p-2.5 rounded-xl border border-gray-800/60">
                    <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>{person.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Accordion Panels (Matching Peoplexio Left Drawers) */}
          <div className="space-y-2.5">
            {/* 1. Account & Identity Info */}
            <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('account')}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-gray-200 hover:bg-[#1A1C23] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-[#7B4DFF]" />
                  <span>Account & System Credentials</span>
                </div>
                {openAccordion === 'account' ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {openAccordion === 'account' && (
                <div className="px-4 pb-4 pt-1 text-xs space-y-2.5 border-t border-gray-800/60 text-gray-400">
                  <div className="flex justify-between items-center py-1">
                    <span>UUID</span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(person.id)}
                      className="inline-flex items-center gap-1 font-mono text-gray-300 hover:text-white"
                    >
                      <span>{person.id.slice(0, 8)}...</span>
                      {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-gray-800/40">
                    <span>Account State</span>
                    <span className={person.isActive ? 'text-emerald-400 font-medium' : 'text-rose-400'}>
                      {person.isActive ? 'Operational / Active' : 'Deactivated'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-gray-800/40">
                    <span>Email Verification</span>
                    <span className={person.isEmailVerified ? 'text-emerald-400' : 'text-amber-400'}>
                      {person.isEmailVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Assigned Devices (Peoplexio Style) */}
            <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('devices')}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-gray-200 hover:bg-[#1A1C23] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Laptop className="w-4 h-4 text-[#7B4DFF]" />
                  <span>Assigned Devices & Hardware</span>
                </div>
                {openAccordion === 'devices' ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {openAccordion === 'devices' && (
                <div className="p-4 border-t border-gray-800/60">
                  <div className="flex items-center gap-3 p-3 bg-[#1A1C23] rounded-xl border border-gray-800/80">
                    <div className="w-10 h-10 rounded-lg bg-[#14151A] border border-gray-700 flex items-center justify-center text-gray-300">
                      <Laptop className="w-5 h-5 text-[#7B4DFF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-200 text-xs truncate">{roleMeta.device}</div>
                      <div className="text-[11px] text-gray-500">{roleMeta.version}</div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Connected" />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Compensation Summary */}
            <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('compensation')}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-gray-200 hover:bg-[#1A1C23] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-[#7B4DFF]" />
                  <span>Compensation & Tier Summary</span>
                </div>
                {openAccordion === 'compensation' ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {openAccordion === 'compensation' && (
                <div className="px-4 pb-4 pt-1 text-xs space-y-2 border-t border-gray-800/60 text-gray-400">
                  <div className="flex justify-between py-1">
                    <span>Pay Schedule</span>
                    <span className="text-gray-200 font-medium">Monthly (1st Week)</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-gray-800/40">
                    <span>Direct Deposit</span>
                    <span className="text-emerald-400 font-medium">Configured</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Employee / Customer Benefits */}
            <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('benefits')}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-gray-200 hover:bg-[#1A1C23] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-[#7B4DFF]" />
                  <span>Benefits & Security Clearance</span>
                </div>
                {openAccordion === 'benefits' ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {openAccordion === 'benefits' && (
                <div className="px-4 pb-4 pt-1 text-xs space-y-2 border-t border-gray-800/60 text-gray-400">
                  <div className="flex justify-between py-1">
                    <span>Portal Access Level</span>
                    <span className="text-[#A78BFA] font-medium">{person.role}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-gray-800/40">
                    <span>Insurance Coverage</span>
                    <span className="text-gray-200 font-medium">Standard KK Group Policy</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER COLUMN: Performance Chart, Time Tracker & Timeline (span 6)        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 xl:col-span-6 space-y-6">
          {/* Top Row: Activity Chart + Time Tracker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Widget 1: Hiring / Activity Progress Chart */}
            <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Weekly Output
                </span>
                <span className="p-1.5 rounded-lg bg-[#1A1C23] text-gray-400 hover:text-white transition-colors">
                  <TrendingUp className="w-3.5 h-3.5 text-[#7B4DFF]" />
                </span>
              </div>

              <div>
                <div className="text-3xl font-extrabold text-gray-100">24</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+20% vs last month</span>
                </div>
              </div>

              {/* Bar Chart Bars */}
              <div className="mt-6 pt-4 border-t border-gray-800/60">
                <div className="flex items-end justify-between h-28 px-2 gap-2">
                  {[
                    { day: 'S', h: '35%' },
                    { day: 'M', h: '60%' },
                    { day: 'T', h: '45%' },
                    { day: 'W', h: '85%', active: true, tag: '24 Shifts' },
                    { day: 'T', h: '55%' },
                    { day: 'F', h: '70%' },
                    { day: 'S', h: '95%' },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {bar.active && (
                        <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-[#7B4DFF] text-white text-[10px] font-bold shadow-md whitespace-nowrap">
                          {bar.tag}
                        </div>
                      )}
                      <div className="w-full max-w-[24px] bg-[#1A1C23] rounded-t-lg h-full flex items-end overflow-hidden">
                        <div
                          style={{ height: bar.h }}
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            bar.active
                              ? 'bg-[#7B4DFF] shadow-[0_0_12px_rgba(123,77,255,0.5)]'
                              : 'bg-gray-700/60 group-hover:bg-[#7B4DFF]/60'
                          }`}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-gray-400 group-hover:text-gray-200">
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Widget 2: Time Tracker (Radial Circular Meter) */}
            <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Active Work Tracker
                </span>
                <span className="p-1.5 rounded-lg bg-[#1A1C23] text-gray-400 hover:text-white transition-colors">
                  <Clock className="w-3.5 h-3.5 text-[#7B4DFF]" />
                </span>
              </div>

              {/* Circular SVG Gauge */}
              <div className="flex flex-col items-center justify-center my-3 relative">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="#232634"
                      strokeWidth="7"
                      fill="transparent"
                      strokeDasharray="2 3"
                    />
                    {/* Animated Active Progress Arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="#7B4DFF"
                      strokeWidth="7"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray={264}
                      strokeDashoffset={isTimerRunning ? 80 : 110}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-extrabold text-gray-100 font-mono tracking-tight">
                      {formatTimer(timerSeconds)}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      Work Time
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning((prev) => !prev)}
                  className="p-3 rounded-2xl bg-[#7B4DFF] hover:bg-[#6A3DEE] text-white shadow-[0_0_15px_rgba(123,77,255,0.4)] transition-all flex items-center justify-center"
                  title={isTimerRunning ? 'Pause Tracker' : 'Start Tracker'}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(9300);
                  }}
                  className="p-3 rounded-2xl bg-[#1A1C23] hover:bg-[#232634] text-gray-400 hover:text-white border border-gray-800 transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Widget 3: Schedule / Timeline Calendar (Matching Peoplexio Timeline) */}
          <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-lg">
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800/60">
              <span className="text-xs text-gray-500 hover:text-gray-300 font-medium cursor-pointer">
                &larr; August
              </span>
              <div className="text-sm font-bold text-gray-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7B4DFF]" />
                <span>September 2024</span>
              </div>
              <span className="text-xs text-gray-500 hover:text-gray-300 font-medium cursor-pointer">
                October &rarr;
              </span>
            </div>

            {/* Days of Week Header Selector */}
            <div className="grid grid-cols-6 gap-2 py-3.5 border-b border-gray-800/60 text-center">
              {[
                { label: 'Mon', day: 22 },
                { label: 'Tue', day: 23 },
                { label: 'Wed', day: 24 },
                { label: 'Thu', day: 25 },
                { label: 'Fri', day: 26 },
                { label: 'Sat', day: 27 },
              ].map((item) => {
                const isActive = selectedDay === item.day;
                return (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() => setSelectedDay(item.day)}
                    className={`p-2 rounded-2xl transition-all flex flex-col items-center justify-center ${
                      isActive
                        ? 'bg-[#7B4DFF] text-white shadow-[0_0_15px_rgba(123,77,255,0.4)]'
                        : 'hover:bg-[#1A1C23] text-gray-400'
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
                    <span className="text-sm font-bold mt-0.5">{item.day}</span>
                  </button>
                );
              })}
            </div>

            {/* Timeline Rows with Hourly Schedule Slots & Event Cards */}
            <div className="pt-4 space-y-3">
              {/* 09:00 AM Slot */}
              <div className="grid grid-cols-12 gap-3 items-center text-xs">
                <div className="col-span-3 text-gray-500 font-mono text-[11px]">09:00 am</div>
                <div className="col-span-9 h-px bg-gray-800/60" />
              </div>

              {/* Event Card: Team Sync */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-3 text-gray-500 font-mono text-[11px]">10:00 am</div>
                <div className="col-span-9">
                  <div className="p-3 bg-gradient-to-r from-[#7B4DFF]/20 to-indigo-900/20 border border-[#7B4DFF]/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-100 flex items-center gap-2">
                        <span>Weekly Operations Sync</span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Discuss field deployments & workflow
                      </div>
                    </div>
                    {/* Avatars */}
                    <div className="flex items-center -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-[#14151A] flex items-center justify-center text-[9px] font-bold text-white">
                        AS
                      </div>
                      <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#14151A] flex items-center justify-center text-[9px] font-bold text-white">
                        RK
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-[#14151A] flex items-center justify-center text-[9px] text-gray-300 font-bold">
                        +2
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 11:00 AM Slot */}
              <div className="grid grid-cols-12 gap-3 items-center text-xs">
                <div className="col-span-3 text-gray-500 font-mono text-[11px]">11:00 am</div>
                <div className="col-span-9 h-px bg-gray-800/60" />
              </div>

              {/* Event Card: Handover Session */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-3 text-gray-500 font-mono text-[11px]">12:00 pm</div>
                <div className="col-span-9">
                  <div className="p-3 bg-gradient-to-r from-amber-500/15 to-orange-900/15 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-200">Shift Handover & Briefing</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Overview of shift tools & tickets
                      </div>
                    </div>
                    {/* Avatars */}
                    <div className="flex items-center -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-amber-600 border-2 border-[#14151A] flex items-center justify-center text-[9px] font-bold text-white">
                        JD
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-[#14151A] flex items-center justify-center text-[9px] text-gray-300 font-bold">
                        +3
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 01:00 PM Slot */}
              <div className="grid grid-cols-12 gap-3 items-center text-xs">
                <div className="col-span-3 text-gray-500 font-mono text-[11px]">01:00 pm</div>
                <div className="col-span-9 h-px bg-gray-800/60" />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Onboarding Meter & Dark Tasks Checklist (span 3)            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-12 xl:col-span-3 space-y-5">
          {/* Widget 1: Onboarding Health Summary Card */}
          <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Profile Health
              </span>
              <span className="text-sm font-extrabold text-white">
                {Math.round((completedCount / tasks.length) * 100)}%
              </span>
            </div>

            {/* Segmented Status Bar (Matching Peoplexio Header) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
                <span>Task 40%</span>
                <span>Verified 35%</span>
                <span>Auth 25%</span>
              </div>
              <div className="w-full h-3 bg-[#1A1C23] rounded-full flex gap-1 p-0.5 overflow-hidden border border-gray-800">
                <div className="h-full bg-[#7B4DFF] rounded-full w-[45%]" />
                <div className="h-full bg-indigo-600 rounded-full w-[35%]" />
                <div className="h-full bg-gray-700 rounded-full flex-1" />
              </div>
            </div>
          </div>

          {/* Widget 2: Onboarding Task Checklist Card (Deep Navy/Indigo Glassmorphic) */}
          <div className="bg-gradient-to-b from-[#13141F] to-[#0F1017] rounded-3xl border border-[#7B4DFF]/30 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#7B4DFF]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-gray-100 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#7B4DFF]" />
                <span>Onboarding Task</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#7B4DFF]/20 text-[#A78BFA] text-xs font-bold font-mono">
                {completedCount}/{tasks.length}
              </span>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
              {tasks.map((task) => {
                const Icon = task.icon;
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      task.completed
                        ? 'bg-[#181926]/90 border-[#7B4DFF]/30 hover:border-[#7B4DFF]/50'
                        : 'bg-[#14151E]/60 border-gray-800/80 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          task.completed
                            ? 'bg-[#7B4DFF] text-white shadow-[0_0_10px_rgba(123,77,255,0.4)]'
                            : 'bg-[#1E202C] text-gray-400 group-hover:text-gray-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-semibold truncate ${
                            task.completed ? 'text-gray-200 line-through opacity-80' : 'text-gray-300'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">{task.date}</div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {task.completed ? (
                        <div className="w-5 h-5 rounded-full bg-[#7B4DFF] text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-600 group-hover:border-gray-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <EditPersonModal
        isOpen={isEditModalOpen}
        person={person}
        onClose={() => setIsEditModalOpen(false)}
        token={token!}
        onSuccess={(updated) => {
          if (updated) {
            setPerson(updated);
          } else {
            handleRefresh();
          }
        }}
      />
    </div>
  );
}
