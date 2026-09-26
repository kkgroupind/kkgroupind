'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  Briefcase,
  ExternalLink,
  Users,
  Building,
  Sparkles,
  Award,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  HardHat,
  Search,
  Filter,
  Pencil,
  Activity,
  Layers,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { api, User, AttendanceRecord, ServiceEnquiry } from '@/services';
import { EditPersonModal } from './edit-person-modal';

interface OfficeStaffDetailViewProps {
  username: string;
  backHref?: string;
  categoryLabel?: string;
}

type TabType = 'profile' | 'activities' | 'dispatches' | 'security';

export function OfficeStaffDetailView({
  username,
  backHref = '/admin/people/office-staff',
  categoryLabel = 'Office Staff',
}: OfficeStaffDetailViewProps) {
  const { token, user: currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [person, setPerson] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Active Pill Tab
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Calendar State
  const today = useMemo(() => new Date(), []);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  // Dispatches search & filter
  const [dispatchSearch, setDispatchSearch] = useState('');
  const [dispatchFilter, setDispatchFilter] = useState<string>('ALL');

  const fetchStaffDetails = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPersonByUsername(username, token);
      if (!data) {
        throw new Error('Staff record not found');
      }
      setPerson(data);
    } catch (err: any) {
      console.error('Failed to load office staff details', err);
      setError(err?.message || 'Could not load staff profile');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, username]);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.push('/admin/login');
      } else {
        fetchStaffDetails();
      }
    }
  }, [authLoading, token, fetchStaffDetails, router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStaffDetails();
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDelete = async () => {
    if (!person || !token) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete Office Staff member "${person.name || person.username}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await api.deletePerson(person.id, token);
      router.push(backHref);
    } catch (err: any) {
      console.error('Failed to delete staff member', err);
      alert(err?.message || 'Failed to delete staff member');
      setIsDeleting(false);
    }
  };

  // Calendar calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  const monthName = currentMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // First day of current month (0: Sun, 1: Mon, ..., 6: Sat)
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startDayOffset = (firstDayOfWeek + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setSelectedDateStr(`${y}-${m}-${d}`);
  };

  // Map of attendances by date (YYYY-MM-DD)
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    if (person?.attendances) {
      for (const att of person.attendances) {
        map.set(att.date, att);
      }
    }
    return map;
  }, [person?.attendances]);

  // Map of dispatches by date (YYYY-MM-DD from createdAt)
  const dispatchesByDate = useMemo(() => {
    const map = new Map<string, ServiceEnquiry[]>();
    if (person?.officeEnquiries) {
      for (const enq of person.officeEnquiries) {
        if (enq.createdAt) {
          const dateStr = enq.createdAt.split('T')[0];
          const existing = map.get(dateStr) || [];
          existing.push(enq);
          map.set(dateStr, existing);
        }
      }
    }
    return map;
  }, [person?.officeEnquiries]);

  // Data for the currently selected date
  const selectedAttendance = attendanceMap.get(selectedDateStr);
  const selectedDispatches = dispatchesByDate.get(selectedDateStr) || [];

  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const isSelectedDateToday = selectedDateStr === todayStr;

  // Formatted date string for header
  const formattedSelectedDate = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDateStr]);

  // Filtered dispatches in the Dispatches tab
  const filteredDispatches = useMemo(() => {
    const list = person?.officeEnquiries || [];
    return list.filter((enq) => {
      const matchesFilter = dispatchFilter === 'ALL' || enq.status === dispatchFilter;
      const q = dispatchSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        enq.serviceName.toLowerCase().includes(q) ||
        enq.trackingNumber.toLowerCase().includes(q) ||
        (enq.customerName && enq.customerName.toLowerCase().includes(q)) ||
        (enq.location && enq.location.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [person?.officeEnquiries, dispatchFilter, dispatchSearch]);

  if (authLoading || (isLoading && !person)) {
    return (
      <div className="max-w-[1550px] mx-auto space-y-6 pb-12 animate-pulse">
        <div className="h-10 w-48 bg-[#14151A] rounded-xl border border-gray-800" />
        <div className="h-28 bg-[#14151A] rounded-3xl border border-gray-800" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-[600px] bg-[#14151A] rounded-3xl border border-gray-800" />
          <div className="lg:col-span-8 h-[600px] bg-[#14151A] rounded-3xl border border-gray-800" />
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
          <h2 className="text-xl font-bold text-gray-100 mb-2">Staff Member Not Found</h2>
          <p className="text-gray-500 text-sm max-w-md mb-6">
            {error || `The staff member @${username} does not exist or has been removed.`}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-[#1A1C23] hover:bg-gray-800 text-gray-300 rounded-xl border border-gray-800 text-sm font-medium transition-colors inline-flex items-center gap-2 cursor-pointer"
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

  const displayName = person.name || person.username || 'Staff Member';
  const initial = displayName.charAt(0).toUpperCase();
  const isStaffAvailable = person.staffStatus === 'AVAILABLE';

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-14 select-none">
      {/* ========================================================
          1. TOP BREADCRUMB & ACTION BAR
      ======================================================== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <NextLink
            href={backHref}
            className="p-2.5 rounded-2xl bg-[#14151A] hover:bg-[#1A1C23] text-gray-400 hover:text-white border border-gray-800 transition-all shadow-sm"
            title="Back to Staff List"
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
            <h1 className="text-2xl font-black text-gray-100 tracking-tight flex items-center gap-2.5 mt-0.5">
              <span>{displayName}</span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-[#7B4DFF]/10 text-[#A78BFA] border-[#7B4DFF]/25">
                Office Staff &bull; Dispatch Coordinator
              </span>
            </h1>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#7B4DFF]/15 hover:bg-[#7B4DFF]/25 border border-[#7B4DFF]/30 text-[#A78BFA] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Modify Account</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#7B4DFF] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ml-auto md:ml-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Removing...' : 'Delete Profile'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. MAIN BODY: LEFT PROFILE CARD + RIGHT PILL NAVS CONTAINER
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            LEFT COLUMN: THE PROFILE HERO CARD (KEPT RIGHT HERE)
        ======================================================== */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 overflow-hidden shadow-xl relative group">
            {/* Top decorative gradient banner */}
            <div className="h-32 bg-gradient-to-br from-[#7B4DFF]/35 via-indigo-950/40 to-transparent relative p-4 flex justify-between items-start">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-gray-200 border border-white/10 shadow-xs">
                KK GROUP STAFF
              </span>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold shadow-xs ${
                  person.isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    person.isActive ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                  }`}
                />
                <span>{person.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            <div className="px-5 pb-5 -mt-16 relative">
              {/* Avatar with Gradient Squircle Frame */}
              <div className="relative inline-block mb-3">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#7B4DFF] via-purple-500 to-sky-400 p-[3px] shadow-[0_8px_25px_rgba(123,77,255,0.35)]">
                  <div className="w-full h-full bg-[#1A1C23] rounded-[21px] flex items-center justify-center text-3xl font-black text-white overflow-hidden">
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
                    {!person.avatar && <span>{initial}</span>}
                  </div>
                </div>
              </div>

              {/* Names & Position */}
              <h2 className="text-xl font-black text-gray-100 tracking-tight leading-snug">
                {displayName}
              </h2>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">
                Senior HR & Dispatch Coordinator
              </p>
              <p className="text-xs text-[#A78BFA] font-mono mt-1">@{person.username}</p>

              {/* Duty / Staff Status Pill */}
              <div className="mt-4 p-3 rounded-2xl bg-[#1A1C23] border border-gray-800/80 flex items-center justify-between shadow-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Desk Availability
                  </span>
                  <span className="text-xs font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isStaffAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    <span>{isStaffAvailable ? 'Available on Desk' : 'Off Duty / Away'}</span>
                  </span>
                </div>
                <div
                  className={`p-2 rounded-xl text-white shadow-sm ${
                    isStaffAvailable ? 'bg-emerald-600' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <Activity className="w-4 h-4" />
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
                  <a
                    href={`tel:${person.phone}`}
                    className="flex items-center gap-2.5 text-gray-300 hover:text-white bg-[#1A1C23] hover:bg-gray-800/80 p-2.5 rounded-xl border border-gray-800/60 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>{person.phone}</span>
                  </a>
                )}
              </div>

              {/* Quick Details Snapshot */}
              <div className="mt-4 pt-4 border-t border-gray-800/60 space-y-2 text-xs text-gray-400">
                <div className="flex justify-between items-center py-1">
                  <span>UUID</span>
                  <button
                    type="button"
                    onClick={() => handleCopyId(person.id)}
                    className="inline-flex items-center gap-1 font-mono text-gray-300 hover:text-white cursor-pointer"
                  >
                    <span>{person.id.slice(0, 8)}...</span>
                    {copiedId ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-500" />
                    )}
                  </button>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-gray-800/40">
                  <span>Enquiries Handled</span>
                  <span className="font-extrabold text-[#A78BFA]">
                    {person._count?.officeEnquiries || person.officeEnquiries?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-gray-800/40">
                  <span>Attendance Records</span>
                  <span className="font-bold text-gray-200">
                    {person._count?.attendances || person.attendances?.length || 0} Days
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-gray-800/40">
                  <span>Role Level</span>
                  <span className="text-purple-300 font-mono font-bold">{person.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: PILL NAVS + DYNAMIC CONTENT PANEL
        ======================================================== */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* ====================================================
              TOP PILL NAVIGATION BAR
          ==================================================== */}
          <div className="bg-[#14151A] rounded-2xl sm:rounded-3xl p-2 border border-gray-800/80 shadow-lg flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'bg-[#7B4DFF] text-white shadow-md shadow-[#7B4DFF]/30 scale-[1.02]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1C23]'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('activities')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'activities'
                    ? 'bg-[#7B4DFF] text-white shadow-md shadow-[#7B4DFF]/30 scale-[1.02]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1C23]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Activities</span>
                {person.attendances && person.attendances.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-black">
                    {person.attendances.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dispatches')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'dispatches'
                    ? 'bg-[#7B4DFF] text-white shadow-md shadow-[#7B4DFF]/30 scale-[1.02]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1C23]'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Dispatches</span>
                {person.officeEnquiries && person.officeEnquiries.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                    {person.officeEnquiries.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'bg-[#7B4DFF] text-white shadow-md shadow-[#7B4DFF]/30 scale-[1.02]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1C23]'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Security & Access</span>
              </button>
            </div>

            {/* Quick date indicator badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A1C23] border border-gray-800 text-[11px] text-gray-400">
              <Clock className="w-3.5 h-3.5 text-[#7B4DFF]" />
              <span>Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* ====================================================
              TAB 1: PROFILE DETAILS
          ==================================================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Overview Bento Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-lg flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#7B4DFF]/15 border border-[#7B4DFF]/30 flex items-center justify-center text-[#A78BFA] shrink-0">
                    <Building className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      Department
                    </span>
                    <h4 className="text-sm font-black text-gray-100 truncate mt-0.5">
                      Operations & Dispatch
                    </h4>
                    <span className="text-[11px] text-gray-400">Kerala Central Desk</span>
                  </div>
                </div>

                <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-lg flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      Clearance Level
                    </span>
                    <h4 className="text-sm font-black text-gray-100 truncate mt-0.5">
                      Tier 2 Coordinator
                    </h4>
                    <span className="text-[11px] text-emerald-400 font-semibold">Authorized Dispatcher</span>
                  </div>
                </div>

                <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-lg flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      Work Orders
                    </span>
                    <h4 className="text-sm font-black text-gray-100 truncate mt-0.5">
                      {person.officeEnquiries?.length || 0} Managed
                    </h4>
                    <span className="text-[11px] text-gray-400">Lifetime dispatches</span>
                  </div>
                </div>
              </div>

              {/* Detailed Personal & System Records Card */}
              <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-6 shadow-lg space-y-6">
                <div>
                  <h3 className="text-base font-black text-gray-100 tracking-tight flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-[#7B4DFF]" />
                    <span>Personal & Professional Record</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Verified office staff member data in the KK Group operational registry.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Legal Full Name</span>
                    <div className="font-bold text-gray-200 text-sm">{person.name || 'Not Specified'}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Portal Username</span>
                    <div className="font-mono font-bold text-[#A78BFA] text-sm">@{person.username}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Official Email</span>
                    <div className="font-semibold text-gray-200 text-sm truncate">{person.email || 'None'}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Phone Contact</span>
                    <div className="font-semibold text-gray-200 text-sm">{person.phone || 'None'}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Account Created</span>
                    <div className="font-semibold text-gray-300">
                      {new Date(person.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Last Profile Update</span>
                    <div className="font-semibold text-gray-300">
                      {new Date(person.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              TAB 2: ACTIVITIES (THE MAIN CENTERPIECE WITH CALENDAR)
          ==================================================== */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              {/* The Calendar & Date Inspector Bento Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* ==============================================
                    CALENDAR WIDGET (span 7)
                ============================================== */}
                <div className="xl:col-span-7 bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 sm:p-6 shadow-xl space-y-5">
                  {/* Calendar Header with Navigation Controls */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#7B4DFF]/15 border border-[#7B4DFF]/30 flex items-center justify-center text-[#A78BFA]">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-gray-100 tracking-tight leading-tight">
                          {monthName}
                        </h3>
                        <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
                          Select any date to inspect activities & duty logs
                        </p>
                      </div>
                    </div>

                    {/* Controls: Prev, Today, Next */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleJumpToToday}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border shadow-xs ${
                          isSelectedDateToday
                            ? 'bg-[#7B4DFF] text-white border-[#7B4DFF]'
                            : 'bg-[#1A1C23] hover:bg-gray-800 text-gray-300 border-gray-800'
                        }`}
                      >
                        Today
                      </button>

                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        aria-label="Previous Month"
                        className="w-8 h-8 rounded-xl bg-[#1A1C23] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleNextMonth}
                        aria-label="Next Month"
                        className="w-8 h-8 rounded-xl bg-[#1A1C23] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Day Names Row (Mon -> Sun) */}
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-gray-500 py-1 uppercase tracking-wider">
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                    <div>Sun</div>
                  </div>

                  {/* Month Days Matrix */}
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {/* Empty padding for days before the 1st */}
                    {Array.from({ length: startDayOffset }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="h-12 sm:h-14 rounded-2xl opacity-20 pointer-events-none" />
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isSelected = selectedDateStr === dayStr;
                      const isToday = todayStr === dayStr;

                      const hasAttendance = attendanceMap.has(dayStr);
                      const attendanceRecord = attendanceMap.get(dayStr);
                      const hasDispatches = dispatchesByDate.has(dayStr);

                      return (
                        <button
                          key={dayStr}
                          type="button"
                          onClick={() => setSelectedDateStr(dayStr)}
                          className={`h-12 sm:h-14 rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-between transition-all cursor-pointer relative group ${
                            isSelected
                              ? 'bg-[#7B4DFF] text-white shadow-lg shadow-[#7B4DFF]/40 ring-2 ring-purple-300 scale-105 z-10'
                              : isToday
                              ? 'bg-[#1A1C23] text-purple-300 ring-2 ring-[#7B4DFF]/50 hover:bg-[#20222D]'
                              : 'bg-[#1A1C23]/60 text-gray-300 hover:bg-[#1A1C23] hover:text-white border border-gray-800/40'
                          }`}
                        >
                          <span
                            className={`text-xs font-black leading-none ${
                              isSelected ? 'text-white' : isToday ? 'text-[#A78BFA]' : ''
                            }`}
                          >
                            {dayNum}
                          </span>

                          {/* Activity Dots Indicators */}
                          <div className="flex items-center gap-1">
                            {hasAttendance && (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected
                                    ? 'bg-white'
                                    : attendanceRecord?.status === 'PRESENT'
                                    ? 'bg-emerald-400'
                                    : 'bg-amber-400'
                                }`}
                                title={`Attendance: ${attendanceRecord?.status}`}
                              />
                            )}
                            {hasDispatches && (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-pink-200' : 'bg-[#FF5E88]'
                                }`}
                                title="Dispatches Handled"
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Calendar Legend */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800/60 text-[11px] text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Present Duty</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF5E88]" />
                        <span>Dispatches Handled</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Leave / Away</span>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-500">Click any day to inspect</span>
                  </div>
                </div>

                {/* ==============================================
                    INSPECTOR: ACTIVITIES ON SELECTED DATE (span 5)
                ============================================== */}
                <div className="xl:col-span-5 space-y-4">
                  {/* Selected Date Header Card */}
                  <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-800/80">
                      <div>
                        <span className="text-[10px] uppercase font-black text-[#A78BFA] tracking-wider">
                          {isSelectedDateToday ? "TODAY'S ACTIVITY" : 'DATE INSPECTION'}
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-gray-100 tracking-tight mt-0.5">
                          {formattedSelectedDate}
                        </h4>
                      </div>
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-[#1A1C23] text-gray-300 border border-gray-800">
                        {selectedDateStr}
                      </span>
                    </div>

                    {/* Attendance Card on that day */}
                    <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HardHat className="w-4 h-4 text-[#7B4DFF]" />
                          <span className="text-xs font-black text-gray-200">Field / Desk Attendance</span>
                        </div>
                        {selectedAttendance ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              selectedAttendance.status === 'PRESENT'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {selectedAttendance.status}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-400">
                            No Attendance Logged
                          </span>
                        )}
                      </div>

                      {selectedAttendance ? (
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div className="bg-[#14151A] p-2.5 rounded-xl border border-gray-800/60">
                            <span className="text-[10px] uppercase font-bold text-gray-500 block">Check In</span>
                            <span className="font-mono font-bold text-gray-200 text-xs mt-0.5 block">
                              {new Date(selectedAttendance.checkInAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="bg-[#14151A] p-2.5 rounded-xl border border-gray-800/60">
                            <span className="text-[10px] uppercase font-bold text-gray-500 block">Check Out</span>
                            <span className="font-mono font-bold text-gray-200 text-xs mt-0.5 block">
                              {selectedAttendance.checkOutAt
                                ? new Date(selectedAttendance.checkOutAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Active on Desk'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">
                          Staff was not clocked into the system on this date.
                        </p>
                      )}

                      {selectedAttendance?.notes && (
                        <div className="text-[11px] text-gray-400 pt-1 border-t border-gray-800/60">
                          <span className="font-bold text-gray-300">Notes:</span> {selectedAttendance.notes}
                        </div>
                      )}
                    </div>

                    {/* Dispatches on that day */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-200 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Dispatches Handled ({selectedDispatches.length})</span>
                        </span>
                        {selectedDispatches.length > 0 && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Active Tasks
                          </span>
                        )}
                      </div>

                      {selectedDispatches.length > 0 ? (
                        <div className="space-y-2 max-h-[260px] overflow-y-auto scrollbar-none pr-1">
                          {selectedDispatches.map((enq) => (
                            <div
                              key={enq.id}
                              className="p-3 rounded-2xl bg-[#1A1C23] border border-gray-800/80 hover:border-[#7B4DFF]/40 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-gray-200 truncate">
                                  {enq.serviceName}
                                </span>
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-500/15 text-purple-300">
                                  {enq.trackingNumber}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                                <span>Client: {enq.customerName}</span>
                                <span className="text-emerald-400 font-semibold">{enq.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-xs text-gray-500 bg-[#1A1C23]/40 rounded-2xl border border-gray-800/50">
                          No work order dispatches logged on this date.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hourly Chronological Timeline on this Date */}
                  <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-xl space-y-3.5">
                    <h5 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#7B4DFF]" />
                      <span>Chronological Timeline</span>
                    </h5>

                    <div className="space-y-3 relative pl-4 border-l border-gray-800">
                      {selectedAttendance ? (
                        <div className="relative">
                          <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-[#14151A]" />
                          <div className="text-xs font-bold text-gray-200">
                            Morning Shift Check-in Logged
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                            {new Date(selectedAttendance.checkInAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} &bull; Attendance Status: {selectedAttendance.status}
                          </div>
                        </div>
                      ) : null}

                      {selectedDispatches.map((enq, idx) => (
                        <div key={enq.id} className="relative">
                          <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#7B4DFF] ring-4 ring-[#14151A]" />
                          <div className="text-xs font-bold text-gray-200">
                            Dispatched: {enq.serviceName}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            Order {enq.trackingNumber} coordinated for {enq.customerName}
                          </div>
                        </div>
                      ))}

                      {selectedAttendance?.checkOutAt ? (
                        <div className="relative">
                          <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-400 ring-4 ring-[#14151A]" />
                          <div className="text-xs font-bold text-gray-200">
                            Shift Check-out Recorded
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                            {new Date(selectedAttendance.checkOutAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      ) : null}

                      {!selectedAttendance && selectedDispatches.length === 0 && (
                        <div className="text-xs text-gray-500 italic">
                          No logged timeline entries for this date.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              TAB 3: DISPATCHES & WORK ORDERS
          ==================================================== */}
          {activeTab === 'dispatches' && (
            <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
                <div>
                  <h3 className="text-base font-black text-gray-100 tracking-tight flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    <span>Work Orders Coordinated by {displayName}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Customer enquiries and service allocations handled by this staff member.
                  </p>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-[#1A1C23] p-1 rounded-2xl border border-gray-800 text-xs font-bold">
                  {['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setDispatchFilter(f)}
                      className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                        dispatchFilter === f
                          ? 'bg-[#7B4DFF] text-white shadow-xs'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {f === 'ALL' ? 'All' : f.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by service, tracking code, client, or site..."
                  value={dispatchSearch}
                  onChange={(e) => setDispatchSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1A1C23] border border-gray-800 rounded-2xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF] transition-all"
                />
              </div>

              {/* Dispatches List */}
              {filteredDispatches.length > 0 ? (
                <div className="space-y-3">
                  {filteredDispatches.map((enq) => {
                    const isCompleted = enq.status === 'COMPLETED';
                    const isInProgress = enq.status === 'IN_PROGRESS';
                    const isAssigned = enq.status === 'ASSIGNED';

                    return (
                      <div
                        key={enq.id}
                        className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/80 hover:border-[#7B4DFF]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-100">{enq.serviceName}</span>
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
                              {enq.trackingNumber}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 flex flex-wrap items-center gap-3">
                            <span>Client: <strong className="text-gray-200">{enq.customerName}</strong> ({enq.customerPhone})</span>
                            {enq.location && <span>&bull; Site: {enq.location}</span>}
                            <span>&bull; Date: {new Date(enq.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black border ${
                              isCompleted
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : isInProgress
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : isAssigned
                                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                : 'bg-gray-800 text-gray-400 border-gray-700'
                            }`}
                          >
                            {enq.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-gray-500 bg-[#1A1C23]/40 rounded-3xl border border-gray-800/50">
                  No work order dispatches found matching the filter.
                </div>
              )}
            </div>
          )}

          {/* ====================================================
              TAB 4: SECURITY & CREDENTIALS
          ==================================================== */}
          {activeTab === 'security' && (
            <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-black text-gray-100 tracking-tight flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#7B4DFF]" />
                  <span>Security & System Authorization</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Access credentials, role hierarchy, and login verification settings.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-200">Role & Access Clearance</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Assigned role: <span className="text-[#A78BFA] font-mono font-bold">{person.role}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-purple-500/15 text-purple-300 font-bold border border-purple-500/30">
                    Tier 2 Staff
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-200">Email Verification Status</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {person.isEmailVerified
                        ? 'Confirmed through secure OTP handshake.'
                        : 'Awaiting initial email verification.'}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-xl font-bold border ${
                      person.isEmailVerified
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {person.isEmailVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-200">Account Operational State</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {person.isActive
                        ? 'Active and allowed to authenticate across KK Group systems.'
                        : 'Account deactivated by Super Admin.'}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-xl font-bold border ${
                      person.isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {person.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Person Modal */}
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
