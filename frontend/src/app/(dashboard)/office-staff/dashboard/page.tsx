'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  Plus,
  RefreshCw,
  Menu,
  ShieldCheck,
  HardHat,
  Users,
  Briefcase,
  UserCircle,
  FolderKanban,
  ClipboardCheck,
  Box,
  CalendarCheck,
  Activity,
  Coffee,
  BarChart3,
  ScrollText,
  Settings as SettingsIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Search,
  IndianRupee,
  User as UserIcon,
} from 'lucide-react';
import {
  AttendanceService,
  EnquiryService,
  ServiceEnquiry,
  WorkerWithAvailability,
  WorkerStatus,
  type User,
  peopleService,
} from '@/services';
import {
  OfficeStaffSidebar,
  OfficeStaffSection,
  StaffAttendanceModal,
  AssignWorkerModal,
  UpdateJobPayModal,
  CreateWorkModal,
  OfficeStaffLoadingScreen,
} from '@/components/OfficeStaff';
import { ActivityFeed } from '@/components/ActivityFeed';
import { NotificationFeed } from '@/components/NotificationFeed';
import { AnnouncementsList } from '@/components/AnnouncementsList';
import { Megaphone } from 'lucide-react';
import { PwaInstallButton } from '@/components/PwaInstall';

// Services Master Catalog
const SERVICES_CATALOG = [
  {
    id: 'cococare',
    title: 'Cococare - Palm Tree Harvesting & Maintenance',
    category: 'Agricultural',
    description:
      'Climbing, crown clearing, organic pest management, and fruit harvesting across plantations and residential properties.',
    squadLead: 'Ratheesh V.',
    turnaround: '2-4 Hours',
  },
  {
    id: 'jcb',
    title: 'JCB Heavy Machinery & Earth Excavation',
    category: 'Heavy Equipment',
    description:
      'Site clearing, foundation trenching, agricultural pond digging, and road formation with hydraulic excavators.',
    squadLead: 'Karan Kumar',
    turnaround: 'Same Day Dispatch',
  },
  {
    id: 'masonry',
    title: 'Plastering & Masonry Services',
    category: 'Civil Construction',
    description:
      'Wall rendering, smooth cement finishing, brick laying, concrete reinforcement, and structural foundation repair.',
    squadLead: 'Ajsal Rahman',
    turnaround: '1-2 Days',
  },
  {
    id: 'painting',
    title: 'Commercial & Residential Painting',
    category: 'Finishing Works',
    description:
      'Exterior weatherproofing, interior emulsion, anti-fungal treatments, and high-pressure spray finishing.',
    squadLead: 'Suresh Kumar',
    turnaround: 'Scheduled',
  },
  {
    id: 'tiling',
    title: 'Tile, Marble & Granite Installation',
    category: 'Finishing Works',
    description:
      'Laser leveling, diamond edge cutting, bathroom waterproofing, and vitrified tile & marble laying.',
    squadLead: 'Biju George',
    turnaround: 'Scheduled',
  },
  {
    id: 'electrical',
    title: 'Electrical & 3-Phase Wiring Systems',
    category: 'Utilities',
    description:
      'Industrial panel configuration, 3-phase wiring, inverter cabling, switchboard maintenance, and safety inspections.',
    squadLead: 'Manoj Pillai',
    turnaround: 'Immediate Dispatch',
  },
  {
    id: 'plumbing',
    title: 'Plumbing & Drainage Systems',
    category: 'Utilities',
    description:
      'Underground pipeline trenching, high-pressure PVC/CPVC installations, septic line repairs, and fixture replacement.',
    squadLead: 'Anoop Nair',
    turnaround: 'Immediate Dispatch',
  },
  {
    id: 'borewell',
    title: 'Borewell Drilling & Groundwater Testing',
    category: 'Heavy Equipment',
    description:
      'Deep aquifer drilling, 6-inch casing pipe installation, submersible pump fitting, and yield testing.',
    squadLead: 'Rajesh Sharma',
    turnaround: 'Scheduled',
  },
];

export interface InvoiceItem {
  id: string;
  name: string;
  amount: number;
}

export interface Invoice {
  id: string;
  code: string;
  customerName: string;
  customerRole?: string;
  customerAvatar?: string;
  customerPhone?: string;
  customerEmail?: string;
  location?: string;
  preferredDate?: string;
  message?: string;
  serviceName: string;
  companyName?: string;
  companyLogo?: string;
  dueInDays?: number;
  status?: 'Unsent' | 'Viewed' | 'Draft' | 'Paid';
  backendStatus?: any;
  items?: InvoiceItem[];
  worker?: {
    id: string;
    name?: string | null;
    username?: string | null;
    phone?: string | null;
    workerStatus: any;
  } | null;
  notes?: string | null;
  rawEnquiry?: any;
}

export default function OfficeStaffDashboardPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();

  // Active Navigation Section
  const [activeSection, setActiveSection] = useState<OfficeStaffSection>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync activeSection from URL query parameters if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sectionParam = params.get('section') as OfficeStaffSection | null;
      if (sectionParam) {
        setActiveSection(sectionParam);
      }
    }
  }, []);

  // Core Data State
  const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>([]);
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [people, setPeople] = useState<User[]>([]);
  const [attendanceOverview, setAttendanceOverview] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING_PAYOUT'>('ALL');

  // Unified Workers & Workforce Subtabs
  const [workerSubTab, setWorkerSubTab] = useState<'directory' | 'availability' | 'attendance' | 'leave'>('directory');

  useEffect(() => {
    if (activeSection === 'workforce-attendance') setWorkerSubTab('attendance');
    else if (activeSection === 'workforce-availability') setWorkerSubTab('availability');
    else if (activeSection === 'workforce-leave') setWorkerSubTab('leave');
    else if (activeSection === 'people-workers' || activeSection === 'people-customers') setWorkerSubTab('directory');
  }, [activeSection]);

  // Attendance & Availability
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceModalMode, setAttendanceModalMode] = useState<'login-prompt' | 'toggle-confirm'>('login-prompt');
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const hasPromptedLoginAttendance = useRef(false);

  // Modals
  const [isCreateWorkModalOpen, setIsCreateWorkModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEnquiryToAssign, setSelectedEnquiryToAssign] = useState<ServiceEnquiry | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedEnquiryToPay, setSelectedEnquiryToPay] = useState<ServiceEnquiry | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Authentication & Role Validation
  useEffect(() => {
    if (!authLoading) {
      if (!token || !user) {
        router.push('/office-staff/login');
      } else if (user.role !== 'OFFICE_STAFF' && user.role !== 'SUPER_ADMIN') {
        router.push('/');
      }
    }
  }, [authLoading, token, user, router]);

  // 2. Load Core Operations Data
  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const [enquiriesRes, workersRes, peopleRes, attendanceRes, myAttendanceRes] =
        await Promise.allSettled([
          EnquiryService.getAllEnquiries({}, token),
          EnquiryService.getActiveWorkers(token),
          peopleService.listPeople(token),
          AttendanceService.getOverview(token),
          AttendanceService.getTodayAttendance(token),
        ]);

      if (enquiriesRes.status === 'fulfilled') {
        setEnquiries(enquiriesRes.value.enquiries || []);
      }
      if (workersRes.status === 'fulfilled') {
        setWorkers(workersRes.value.workers || []);
      }
      if (peopleRes.status === 'fulfilled') {
        setPeople(peopleRes.value.data || []);
      }
      if (attendanceRes.status === 'fulfilled') {
        setAttendanceOverview(attendanceRes.value);
      }
      if (myAttendanceRes.status === 'fulfilled') {
        const staffStatus = myAttendanceRes.value.staffStatus;
        const available = staffStatus === 'AVAILABLE';
        setIsAvailable(available);

        // Attendance confirmation check upon initial login
        if (!hasPromptedLoginAttendance.current) {
          hasPromptedLoginAttendance.current = true;
          if (staffStatus === 'OFF_DUTY' || !staffStatus) {
            setAttendanceModalMode('login-prompt');
            setIsAttendanceModalOpen(true);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load operations dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token, loadDashboardData]);

  // Open Availability confirmation modal
  const handleOpenToggleModal = () => {
    setAttendanceModalMode('toggle-confirm');
    setIsAttendanceModalOpen(true);
  };

  // Handle Attendance status confirmation
  const handleConfirmAttendance = async (status: 'AVAILABLE' | 'OFF_DUTY') => {
    if (!token) return;
    setIsTogglingAvailability(true);
    try {
      await AttendanceService.updateStatus(status, token);
      setIsAvailable(status === 'AVAILABLE');
      setIsAttendanceModalOpen(false);
      showToast(
        status === 'AVAILABLE'
          ? 'You are marked as Available on desk.'
          : 'Status changed to Off Duty.',
      );
      loadDashboardData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update attendance status');
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  const handleOpenAssignModal = (enquiry: ServiceEnquiry) => {
    setSelectedEnquiryToAssign(enquiry);
    setIsAssignModalOpen(true);
  };

  // Computed Metrics
  const pendingPayoutWorks = useMemo(() => {
    return enquiries
      .filter((e) => e.status === 'COMPLETED' && (!e.totalCalculatedWage || Number(e.totalCalculatedWage) === 0))
      .sort((a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime());
  }, [enquiries]);

  const stats = useMemo(() => {
    const totalEnquiries = enquiries.length;
    const pendingEnquiries = enquiries.filter((e) => e.status === 'PENDING').length;
    const assignedEnquiries = enquiries.filter((e) => e.status === 'ASSIGNED').length;
    const inProgressEnquiries = enquiries.filter((e) => e.status === 'IN_PROGRESS').length;
    const completedEnquiries = enquiries.filter((e) => e.status === 'COMPLETED').length;

    const availableWorkers = workers.filter((w) => w.workerStatus === 'AVAILABLE').length;
    const busyWorkers = workers.filter((w) => w.workerStatus === 'BUSY').length;
    const offDutyWorkers = workers.filter((w) => w.workerStatus === 'OFF_DUTY').length;

    return {
      totalEnquiries,
      pendingEnquiries,
      activeWorks: assignedEnquiries + inProgressEnquiries,
      completedEnquiries,
      pendingPayout: pendingPayoutWorks.length,
      availableWorkers,
      busyWorkers,
      offDutyWorkers,
      totalWorkers: workers.length,
    };
  }, [enquiries, workers, pendingPayoutWorks]);

  const getWorkPriority = (item: ServiceEnquiry): number => {
    // 1. PENDING assignment: needs squad allocation
    if (item.status === 'PENDING') return 1;
    // 2. PENDING payout: completed job requiring wage settlement
    if (item.status === 'COMPLETED' && (!item.totalCalculatedWage || Number(item.totalCalculatedWage) === 0)) return 2;
    // 3. IN_PROGRESS: active field tasks
    if (item.status === 'IN_PROGRESS') return 3;
    // 4. ASSIGNED: allocated squad
    if (item.status === 'ASSIGNED') return 4;
    // 5. COMPLETED: finalized & settled
    return 5;
  };

  // Filtered Enquiries / Works
  const filteredEnquiries = useMemo(() => {
    const list = enquiries.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerPhone.includes(searchQuery);

      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'PENDING_PAYOUT'
          ? item.status === 'COMPLETED' && (!item.totalCalculatedWage || Number(item.totalCalculatedWage) === 0)
          : item.status === statusFilter;

      return matchSearch && matchStatus;
    });

    if (statusFilter === 'ALL') {
      return [...list].sort((a, b) => {
        const priorityDiff = getWorkPriority(a) - getWorkPriority(b);
        if (priorityDiff !== 0) return priorityDiff;
        const timeA = new Date(a.createdAt || a.updatedAt).getTime();
        const timeB = new Date(b.createdAt || b.updatedAt).getTime();
        return timeB - timeA;
      });
    }

    if (statusFilter === 'PENDING_PAYOUT') {
      return [...list].sort(
        (a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime(),
      );
    }
    return [...list].sort(
      (a, b) => new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime(),
    );
  }, [enquiries, searchQuery, statusFilter]);

  // People Lists
  const customersList = useMemo(() => people.filter((p) => p.role === 'CUSTOMER'), [people]);
  const workersList = useMemo(() => workers, [workers]);

  if (authLoading || (!user && isLoadingData)) {
    return <OfficeStaffLoadingScreen title="Connecting Operations Desk..." />;
  }

  return (
    <div className="min-h-screen bg-[#ABD2FA] text-[#091540] flex font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-white text-[#091540] px-4 py-2.5 rounded-xl shadow-xl border border-[#7692FF]/40 flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
          <div className="w-2 h-2 rounded-full bg-[#1B2CC1]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Sidebar */}
      <OfficeStaffSidebar
        activeSection={activeSection}
        onSelectSection={(sec) => {
          if (sec === 'profile') {
            router.push('/office-staff/profile');
            return;
          }
          setActiveSection(sec);
        }}
        isAvailable={isAvailable}
        onToggleAvailability={handleOpenToggleModal}
        userName={user?.name || user?.username || 'Office Staff'}
        userRole={user?.role || 'OFFICE_STAFF'}
        userAvatar={user?.avatar}
        unreadEnquiriesCount={stats.pendingEnquiries}
        availableWorkersCount={stats.availableWorkers}
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
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#7692FF]/30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white text-[#1B2CC1] hover:bg-[#ABD2FA]/30 border border-[#7692FF]/30 transition-colors shadow-xs"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-[#1B2CC1] font-bold uppercase tracking-wider">
                Office Staff Portal
              </span>
              <h1 className="text-sm sm:text-base font-bold text-[#091540] tracking-tight truncate capitalize">
                {activeSection.replace('-', ' / ')}
              </h1>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Availability Pill */}
            <button
              type="button"
              onClick={handleOpenToggleModal}
              disabled={isTogglingAvailability}
              className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                isAvailable
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100/70'
                  : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100/70'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAvailable ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{isAvailable ? 'Available on Desk' : 'Off Duty'}</span>
            </button>

            {/* PWA Download App Button */}
            <PwaInstallButton role="office-staff" variant="navbar" />

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => {
                loadDashboardData();
                showToast('Data refreshed');
              }}
              disabled={isLoadingData}
              className="p-2 sm:px-3 rounded-xl bg-white hover:bg-[#ABD2FA]/20 text-[#1B2CC1] border border-[#7692FF]/30 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Create Work Order Button */}
            <button
              type="button"
              onClick={() => setIsCreateWorkModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#1B2CC1] hover:bg-[#15239E] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-[#1B2CC1]/25 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Work</span>
            </button>
          </div>
        </header>

        {/* Dynamic Section Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Section: Dashboard */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Stats Cards: 5 in a single row on mobile & desktop */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-3 lg:gap-4">
                {/* 1. Pending Enquiries */}
                <div
                  onClick={() => setActiveSection('operations-enquiries')}
                  className="p-2 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-white/80 hover:border-[#7692FF]/50 transition-all cursor-pointer shadow-[0_4px_16px_rgba(9,21,64,0.06)] hover:shadow-[0_8px_24px_rgba(9,21,64,0.12)] flex flex-col justify-between items-center sm:items-start text-center sm:text-left min-w-0"
                >
                  <div className="flex items-center justify-between w-full mb-1 sm:mb-3">
                    <span className="hidden sm:inline text-xs font-bold text-[#091540]">Pending Enquiries</span>
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#ABD2FA]/40 flex items-center justify-center text-[#1B2CC1] border border-[#7692FF]/30 shrink-0 mx-auto sm:mx-0">
                      <FolderKanban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                  <div className="text-base sm:text-2xl font-black text-[#091540] my-0.5 sm:my-0">
                    {stats.pendingEnquiries}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold sm:font-medium truncate w-full">
                    <span className="sm:hidden">Enquiries</span>
                    <span className="hidden sm:inline">{stats.totalEnquiries} total requests</span>
                  </span>
                </div>

                {/* 2. Active Works */}
                <div
                  onClick={() => setActiveSection('operations-works')}
                  className="p-2 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-white/80 hover:border-[#7692FF]/50 transition-all cursor-pointer shadow-[0_4px_16px_rgba(9,21,64,0.06)] hover:shadow-[0_8px_24px_rgba(9,21,64,0.12)] flex flex-col justify-between items-center sm:items-start text-center sm:text-left min-w-0"
                >
                  <div className="flex items-center justify-between w-full mb-1 sm:mb-3">
                    <span className="hidden sm:inline text-xs font-bold text-[#091540]">Active Works</span>
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#ABD2FA]/40 flex items-center justify-center text-[#1B2CC1] border border-[#7692FF]/30 shrink-0 mx-auto sm:mx-0">
                      <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                  <div className="text-base sm:text-2xl font-black text-[#091540] my-0.5 sm:my-0">
                    {stats.activeWorks}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold sm:font-medium truncate w-full">
                    <span className="sm:hidden">Works</span>
                    <span className="hidden sm:inline">Assigned and active</span>
                  </span>
                </div>

                {/* 3. Finished Works Awaiting Payout */}
                <div
                  onClick={() => {
                    setActiveSection('operations-works');
                    setStatusFilter('PENDING_PAYOUT');
                  }}
                  className={`p-2 sm:p-5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer shadow-[0_4px_16px_rgba(9,21,64,0.06)] hover:shadow-[0_8px_24px_rgba(9,21,64,0.12)] flex flex-col justify-between items-center sm:items-start text-center sm:text-left min-w-0 ${
                    stats.pendingPayout > 0
                      ? 'bg-amber-50 border-amber-300 hover:border-amber-400'
                      : 'bg-white border-white/80 hover:border-[#7692FF]/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1 sm:mb-3">
                    <span className="hidden sm:inline text-xs font-bold text-[#091540]">Payout Pending</span>
                    <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center border shrink-0 mx-auto sm:mx-0 ${
                      stats.pendingPayout > 0
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                  <div className={`text-base sm:text-2xl font-black my-0.5 sm:my-0 ${stats.pendingPayout > 0 ? 'text-amber-700' : 'text-[#091540]'}`}>
                    {stats.pendingPayout}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold sm:font-medium truncate w-full">
                    <span className="sm:hidden">Payouts</span>
                    <span className="hidden sm:inline">Awaiting worker pay</span>
                  </span>
                </div>

                {/* 4. Available Workers */}
                <div
                  onClick={() => setActiveSection('workforce-availability')}
                  className="p-2 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-white/80 hover:border-[#7692FF]/50 transition-all cursor-pointer shadow-[0_4px_16px_rgba(9,21,64,0.06)] hover:shadow-[0_8px_24px_rgba(9,21,64,0.12)] flex flex-col justify-between items-center sm:items-start text-center sm:text-left min-w-0"
                >
                  <div className="flex items-center justify-between w-full mb-1 sm:mb-3">
                    <span className="hidden sm:inline text-xs font-bold text-[#091540]">Available Workers</span>
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200 shrink-0 mx-auto sm:mx-0">
                      <HardHat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                  <div className="text-base sm:text-2xl font-black text-emerald-600 my-0.5 sm:my-0">
                    {stats.availableWorkers}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold sm:font-medium truncate w-full">
                    <span className="sm:hidden">Workers</span>
                    <span className="hidden sm:inline">{stats.busyWorkers} busy &bull; {stats.offDutyWorkers} away</span>
                  </span>
                </div>

                {/* 5. Desk Presence */}
                <div
                  onClick={handleOpenToggleModal}
                  className="p-2 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-white/80 hover:border-[#7692FF]/50 transition-all cursor-pointer shadow-[0_4px_16px_rgba(9,21,64,0.06)] hover:shadow-[0_8px_24px_rgba(9,21,64,0.12)] flex flex-col justify-between items-center sm:items-start text-center sm:text-left min-w-0"
                >
                  <div className="flex items-center justify-between w-full mb-1 sm:mb-3">
                    <span className="hidden sm:inline text-xs font-bold text-[#091540]">Desk Presence</span>
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#ABD2FA]/40 flex items-center justify-center text-[#1B2CC1] border border-[#7692FF]/30 shrink-0 mx-auto sm:mx-0">
                      <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                  <div className="text-sm sm:text-xl font-black text-[#091540] flex items-center gap-1.5 my-0.5 sm:my-0">
                    <span
                      className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${
                        isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <span className="hidden sm:inline">{isAvailable ? 'Available' : 'Unavailable'}</span>
                    <span className="sm:hidden text-xs">{isAvailable ? 'Desk' : 'Away'}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-[#1B2CC1] font-bold truncate w-full">
                    <span className="sm:hidden">Toggle</span>
                    <span className="hidden sm:inline">Click to switch</span>
                  </span>
                </div>
              </div>

              {/* Finished Works Awaiting Worker Payout Action Section */}
              {pendingPayoutWorks.length > 0 && (
                <div className="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-md flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <IndianRupee className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-amber-950">
                            {pendingPayoutWorks.length} Completed {pendingPayoutWorks.length === 1 ? 'Work' : 'Works'} Awaiting Worker Payout
                          </h3>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                            Payment Needed
                          </span>
                        </div>
                        <p className="text-xs text-amber-800/80 mt-0.5 font-medium">
                          These jobs are marked completed by field technicians. Assign final wage &amp; payment method.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection('operations-works');
                        setStatusFilter('PENDING_PAYOUT');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>View All Pending ({pendingPayoutWorks.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Card Row of Latest Finished Works Without Payout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {pendingPayoutWorks.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-xs flex flex-col justify-between gap-3 hover:border-amber-400 transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-[#1B2CC1]">
                              {job.trackingNumber}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {new Date(job.completedAt || job.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-[#091540] truncate">
                            {job.serviceName}
                          </div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1">
                            <UserIcon className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{job.customerName}</span>
                          </div>
                          <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <HardHat className="w-3 h-3" />
                            <span>{job.worker?.name || job.worker?.username || 'Field Operative'}</span>
                          </div>
                          {job.completedUnits ? (
                            <div className="text-[11px] font-medium text-slate-500">
                              Logged: <strong className="text-slate-800">{job.completedUnits} {job.unitLabel || 'Units'}</strong>
                            </div>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEnquiryToPay(job);
                            setIsPayModalOpen(true);
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                        >
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>Assign Payment</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Banner */}
              <div className="p-5 rounded-2xl bg-white border border-white/80 shadow-[0_4px_16px_rgba(9,21,64,0.06)] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#091540]">
                    Operations Dispatch Desk
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    Directly create work orders, assign available workers, or review incoming requests.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCreateWorkModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#1B2CC1] hover:bg-[#15239E] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#1B2CC1]/25"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Work</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('operations-assignments')}
                    className="px-3.5 py-2 rounded-xl bg-[#ABD2FA]/30 hover:bg-[#ABD2FA]/60 text-[#1B2CC1] text-xs font-bold flex items-center gap-1.5 transition-colors border border-[#7692FF]/40"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Assignments</span>
                  </button>
                </div>
              </div>

              {/* Recent Works & Enquiries Cards */}
              <div className="bg-white rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(9,21,64,0.06)] overflow-hidden">
                <div className="p-3.5 sm:p-4 border-b border-sky-100 flex items-center justify-between bg-[#F8FBFF]">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#091540]">
                      Recent Works & Enquiries
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500">Live operational orders & requests</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection('operations-works')}
                    className="text-[11px] sm:text-xs font-bold text-[#1B2CC1] hover:underline flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2.5 sm:p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3.5">
                    {filteredEnquiries.slice(0, 8).map((job) => (
                      <div
                        key={job.id}
                        className="bg-white hover:bg-sky-50/40 rounded-xl border border-sky-100/90 hover:border-[#1B2CC1]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-2.5 sm:p-3.5 group"
                      >
                        {/* Header: Tracking & Status */}
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1.5">
                            <span className="font-mono font-black text-[10px] sm:text-xs text-[#1B2CC1] tracking-tight truncate">
                              {job.trackingNumber}
                            </span>
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold uppercase shrink-0 ${
                                job.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : job.status === 'IN_PROGRESS'
                                  ? 'bg-sky-50 text-[#1B2CC1] border border-sky-200'
                                  : job.status === 'ASSIGNED'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {job.status === 'IN_PROGRESS' ? 'Progress' : job.status}
                            </span>
                          </div>

                          {/* Service Name */}
                          <h4
                            className="text-xs sm:text-sm font-bold text-[#091540] truncate leading-tight"
                            title={job.serviceName}
                          >
                            {job.serviceName}
                          </h4>

                          {/* Customer Info */}
                          <div className="mt-1.5 space-y-0.5 text-[10px] sm:text-[11px] text-slate-600">
                            <div className="flex items-center gap-1 font-semibold text-slate-800 truncate">
                              <UserIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{job.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 truncate text-[9px] sm:text-[10px]">
                              <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <span className="truncate">{job.customerPhone}</span>
                            </div>
                          </div>

                          {/* Worker Assignment */}
                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-1 text-[10px] sm:text-[11px] truncate">
                            <HardHat className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#1B2CC1] shrink-0" />
                            {job.worker ? (
                              <span className="font-bold text-[#091540] truncate">
                                {job.worker.name || job.worker.username}
                              </span>
                            ) : (
                              <span className="text-amber-600 font-semibold italic text-[9px] sm:text-[10px]">
                                Unassigned
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action CTA */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          {job.status === 'PENDING' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAssignModal(job)}
                              className="w-full py-1.5 px-2 rounded-lg bg-[#1B2CC1] hover:bg-[#15239E] text-white text-[10px] sm:text-xs font-bold transition-all shadow-xs text-center cursor-pointer"
                            >
                              Assign
                            </button>
                          ) : job.status === 'COMPLETED' && (!job.totalCalculatedWage || Number(job.totalCalculatedWage) === 0) ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEnquiryToPay(job);
                                setIsPayModalOpen(true);
                              }}
                              className="w-full py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] sm:text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <IndianRupee className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              <span>Assign Pay</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveSection('operations-works')}
                              className="w-full py-1.5 px-2 rounded-lg bg-[#ABD2FA]/30 hover:bg-[#ABD2FA]/60 text-[#1B2CC1] border border-[#7692FF]/30 text-[10px] sm:text-xs font-bold transition-colors text-center cursor-pointer"
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredEnquiries.length === 0 && (
                    <div className="py-10 text-center text-slate-400 text-xs italic">
                      No works or enquiries found matching your search.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section: Field Workers & Workforce (Unified) */}
          {(activeSection.startsWith('people') || activeSection.startsWith('workforce')) && (
            <div className="space-y-6">
              {/* Workers & Workforce Subtabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/80 rounded-xl border border-white/90 shadow-xs w-fit text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setWorkerSubTab('directory')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    workerSubTab === 'directory'
                      ? 'bg-[#1B2CC1] text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-[#091540]'
                  }`}
                >
                  <HardHat className="w-3.5 h-3.5" />
                  <span>Workers Directory ({workersList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWorkerSubTab('availability')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    workerSubTab === 'availability'
                      ? 'bg-[#1B2CC1] text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-[#091540]'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Live Availability ({stats.availableWorkers} Available)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWorkerSubTab('attendance')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    workerSubTab === 'attendance'
                      ? 'bg-[#1B2CC1] text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-[#091540]'
                  }`}
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Daily Attendance</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWorkerSubTab('leave')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    workerSubTab === 'leave'
                      ? 'bg-[#1B2CC1] text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-[#091540]'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Leave Records ({stats.offDutyWorkers})</span>
                </button>
              </div>

              {/* 1. Workers Directory View */}
              {workerSubTab === 'directory' && (
                <div className="bg-white rounded-2xl border border-white/80 shadow-md overflow-hidden">
                  <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#091540]">Field Workers Directory</h3>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Active personnel registered for Kerala operations</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
                      <span className="text-emerald-700 font-semibold">{stats.availableWorkers} Available</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-blue-700 font-semibold">{stats.busyWorkers} Busy</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-slate-500 font-semibold">{stats.offDutyWorkers} Off</span>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3.5">
                      {workersList.map((worker) => (
                        <div
                          key={worker.id}
                          className="bg-white hover:bg-slate-50/80 rounded-xl border border-slate-200/90 hover:border-[#1B2CC1]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-2.5 sm:p-3.5 group"
                        >
                          <div>
                            {/* Avatar & Status */}
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1B2CC1]/10 text-[#1B2CC1] font-black text-xs flex items-center justify-center shrink-0">
                                {worker.name
                                  ? worker.name.charAt(0).toUpperCase()
                                  : worker.username
                                  ? worker.username.charAt(0).toUpperCase()
                                  : 'W'}
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shrink-0 ${
                                  worker.workerStatus === 'AVAILABLE'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : worker.workerStatus === 'BUSY'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    worker.workerStatus === 'AVAILABLE'
                                      ? 'bg-emerald-500'
                                      : worker.workerStatus === 'BUSY'
                                      ? 'bg-blue-500'
                                      : 'bg-slate-400'
                                  }`}
                                />
                                {worker.workerStatus === 'AVAILABLE' ? 'Avail' : worker.workerStatus === 'OFF_DUTY' ? 'Off' : worker.workerStatus}
                              </span>
                            </div>

                            {/* Name & Username */}
                            <div className="font-bold text-[#091540] text-xs sm:text-sm truncate">
                              {worker.name || worker.username}
                            </div>
                            <div className="font-mono text-[10px] sm:text-[11px] text-[#1B2CC1] font-semibold truncate">
                              @{worker.username}
                            </div>

                            {/* Phone */}
                            {worker.phone ? (
                              <a
                                href={`tel:${worker.phone}`}
                                className="text-[10px] sm:text-[11px] text-slate-600 hover:text-[#1B2CC1] flex items-center gap-1 mt-1.5 truncate"
                              >
                                <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span className="truncate">{worker.phone}</span>
                              </a>
                            ) : (
                              <div className="text-[10px] text-slate-400 mt-1.5 italic">No phone</div>
                            )}
                          </div>

                          {/* Footer: Assignments count */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px]">
                            <span className="text-slate-500 font-medium">Active:</span>
                            <span className="font-black text-[#091540] bg-slate-100 px-1.5 py-0.5 rounded-md text-[10px]">
                              {worker._count?.workerAssignments ?? 0} jobs
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {workersList.length === 0 && (
                      <div className="py-10 text-center text-slate-400 text-xs italic">
                        No field workers found.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Live Availability View */}
              {workerSubTab === 'availability' && (
                <div className="bg-white rounded-2xl border border-white/80 p-3.5 sm:p-5 space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#091540]">Live Worker Availability</h3>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Real-time status of on-duty and dispatch-ready staff</p>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                      {stats.availableWorkers} ready for dispatch
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {workers.map((worker) => (
                      <div
                        key={worker.id}
                        className={`p-2.5 sm:p-3.5 rounded-xl border transition-all bg-slate-50 hover:bg-white hover:shadow-xs flex flex-col justify-between ${
                          worker.workerStatus === 'AVAILABLE'
                            ? 'border-emerald-200'
                            : worker.workerStatus === 'BUSY'
                            ? 'border-blue-200'
                            : 'border-slate-200 opacity-70'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5 gap-1">
                            <span className="text-xs font-bold text-[#091540] truncate">
                              {worker.name || worker.username}
                            </span>
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                worker.workerStatus === 'AVAILABLE'
                                  ? 'bg-emerald-500'
                                  : worker.workerStatus === 'BUSY'
                                  ? 'bg-blue-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-500 mb-2 truncate">
                            {worker.phone || 'No phone'}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] pt-2 border-t border-slate-200">
                          <span className="text-slate-500 font-medium">Status:</span>
                          <span className={
                            worker.workerStatus === 'AVAILABLE' ? 'text-emerald-700 font-bold' : 'text-slate-600 font-medium'
                          }>
                            {worker.workerStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Daily Attendance View */}
              {workerSubTab === 'attendance' && (
                <div className="bg-white rounded-2xl border border-white/80 p-5 space-y-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#091540]">Daily Attendance & Presence</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Presence records for {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenToggleModal}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                        isAvailable
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-[#1B2CC1] hover:bg-[#15239E] text-white'
                      }`}
                    >
                      {isAvailable ? 'Mark Desk as Away' : 'Mark Desk as Available'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Office Staff Attendance */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <h4 className="text-xs font-bold text-[#091540] mb-3">Office Staff Desk</h4>
                      <div className="space-y-2">
                        {attendanceOverview?.officeStaff?.map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
                            <span className="font-semibold text-slate-800">{s.name || s.username}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              s.isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {s.isAvailable ? 'Available' : 'Away'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Workers Attendance */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <h4 className="text-xs font-bold text-[#091540] mb-3">Field Workers</h4>
                      <div className="space-y-2">
                        {attendanceOverview?.workers?.map((w: any) => (
                          <div key={w.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
                            <span className="font-semibold text-slate-800">{w.name || w.username}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              w.workerStatus === 'AVAILABLE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : w.workerStatus === 'BUSY'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {w.workerStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Leave Records View */}
              {workerSubTab === 'leave' && (
                <div className="bg-white rounded-2xl border border-white/80 p-5 space-y-4 shadow-md">
                  <h3 className="text-sm font-bold text-[#091540]">Personnel on Leave / Off Duty</h3>
                  <div className="space-y-2">
                    {workers
                      .filter((w) => w.workerStatus === 'OFF_DUTY')
                      .map((w) => (
                        <div
                          key={w.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#091540]">{w.name || w.username}</span>
                            <div className="text-[11px] text-slate-500">Phone: {w.phone || '—'}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Off Duty
                          </span>
                        </div>
                      ))}
                    {workers.filter((w) => w.workerStatus === 'OFF_DUTY').length === 0 && (
                      <div className="p-8 text-center text-slate-400 text-xs italic">
                        No personnel currently marked as off duty today.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section: Operations */}
          {activeSection.startsWith('operations') && (
            <div className="space-y-6">
              {/* Operations Subtabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/80 rounded-xl border border-white/90 shadow-xs w-fit text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveSection('operations-enquiries')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeSection === 'operations-enquiries'
                      ? 'bg-[#1B2CC1] text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-[#091540]'
                  }`}
                >
                  Enquiries ({stats.pendingEnquiries})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('operations-works')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeSection === 'operations-works'
                      ? 'bg-[#1B2CC1] text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-[#091540]'
                  }`}
                >
                  Works ({enquiries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('operations-assignments')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeSection === 'operations-assignments'
                      ? 'bg-[#1B2CC1] text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-[#091540]'
                  }`}
                >
                  Assignments
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('operations-services')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeSection === 'operations-services'
                      ? 'bg-[#1B2CC1] text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-[#091540]'
                  }`}
                >
                  Services ({SERVICES_CATALOG.length})
                </button>
              </div>

              {/* 1. Enquiries View */}
              {activeSection === 'operations-enquiries' && (
                <div className="bg-white rounded-2xl border border-white/80 p-3.5 sm:p-5 space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#091540]">Pending Customer Enquiries</h3>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                        New requests waiting for worker assignment.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCreateWorkModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1B2CC1] hover:bg-[#15239E] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Work</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3.5">
                    {enquiries
                      .filter((e) => e.status === 'PENDING')
                      .map((enquiry) => (
                        <div
                          key={enquiry.id}
                          className="bg-white hover:bg-amber-50/20 rounded-xl border border-amber-200/70 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-2.5 sm:p-3.5 group"
                        >
                          <div>
                            {/* Header: Tracking & Status */}
                            <div className="flex items-start justify-between gap-1 mb-1.5">
                              <span className="font-mono font-black text-[10px] sm:text-xs text-[#1B2CC1] tracking-tight truncate">
                                {enquiry.trackingNumber}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                PENDING
                              </span>
                            </div>

                            {/* Service */}
                            <h4
                              className="text-xs sm:text-sm font-bold text-[#091540] truncate leading-tight"
                              title={enquiry.serviceName}
                            >
                              {enquiry.serviceName}
                            </h4>

                            {/* Customer Info */}
                            <div className="mt-1.5 space-y-0.5 text-[10px] sm:text-[11px] text-slate-600">
                              <div className="flex items-center gap-1 font-semibold text-slate-800 truncate">
                                <UserIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{enquiry.customerName}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500 truncate text-[9px] sm:text-[10px]">
                                <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span className="truncate">{enquiry.customerPhone}</span>
                              </div>
                            </div>

                            {/* Requirements/Message */}
                            {enquiry.message && (
                              <p className="mt-2 text-[10px] text-slate-500 line-clamp-2 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                "{enquiry.message}"
                              </p>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => handleOpenAssignModal(enquiry)}
                              className="w-full py-1.5 px-2 rounded-lg bg-[#1B2CC1] hover:bg-[#15239E] text-white text-[10px] sm:text-xs font-bold transition-all shadow-xs text-center cursor-pointer"
                            >
                              Assign Worker
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {enquiries.filter((e) => e.status === 'PENDING').length === 0 && (
                    <div className="py-10 text-center text-slate-400 text-xs italic">
                      No pending enquiries waiting for assignment.
                    </div>
                  )}
                </div>
              )}

              {/* 2. Works View */}
              {activeSection === 'operations-works' && (
                <div className="bg-white rounded-2xl border border-white/80 p-3.5 sm:p-5 space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#091540]">All Work Orders</h3>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                        Overview of all works created directly or through enquiries.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCreateWorkModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1B2CC1] hover:bg-[#15239E] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Work Order</span>
                    </button>
                  </div>

                  {/* Status Filters */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'PENDING_PAYOUT'] as const).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatusFilter(st)}
                          className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 ${
                            statusFilter === st
                              ? st === 'PENDING_PAYOUT'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-[#1B2CC1] text-white shadow-xs'
                              : st === 'PENDING_PAYOUT'
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
                              : 'bg-slate-100 text-slate-600 hover:text-[#091540] border border-slate-200'
                          }`}
                        >
                          {st === 'PENDING_PAYOUT' ? (
                            <>
                              <IndianRupee className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span>Payout ({pendingPayoutWorks.length})</span>
                            </>
                          ) : (
                            st
                          )}
                        </button>
                      ),
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3.5">
                    {filteredEnquiries.map((work) => (
                      <div
                        key={work.id}
                        className="bg-white hover:bg-sky-50/40 rounded-xl border border-sky-100/90 hover:border-[#1B2CC1]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-2.5 sm:p-3.5 group"
                      >
                        <div>
                          {/* Header: Tracking & Status */}
                          <div className="flex items-start justify-between gap-1 mb-1.5">
                            <span className="font-mono font-black text-[10px] sm:text-xs text-[#1B2CC1] tracking-tight truncate">
                              {work.trackingNumber}
                            </span>
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold uppercase shrink-0 ${
                                work.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : work.status === 'IN_PROGRESS'
                                  ? 'bg-sky-50 text-[#1B2CC1] border border-sky-200'
                                  : work.status === 'ASSIGNED'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {work.status === 'IN_PROGRESS' ? 'Progress' : work.status}
                            </span>
                          </div>

                          {/* Service Name */}
                          <h4
                            className="text-xs sm:text-sm font-bold text-[#091540] truncate leading-tight"
                            title={work.serviceName}
                          >
                            {work.serviceName}
                          </h4>

                          {/* Customer Info */}
                          <div className="mt-1.5 space-y-0.5 text-[10px] sm:text-[11px] text-slate-600">
                            <div className="flex items-center gap-1 font-semibold text-slate-800 truncate">
                              <UserIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{work.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 truncate text-[9px] sm:text-[10px]">
                              <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <span className="truncate">{work.customerPhone}</span>
                            </div>
                          </div>

                          {/* Worker Assignment */}
                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-1 text-[10px] sm:text-[11px] truncate">
                            <HardHat className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#1B2CC1] shrink-0" />
                            {work.worker ? (
                              <span className="font-bold text-[#091540] truncate">
                                {work.worker.name || work.worker.username}
                              </span>
                            ) : (
                              <span className="text-amber-600 font-semibold italic text-[9px] sm:text-[10px]">
                                Unassigned
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions / Wage CTA */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          {!work.worker ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAssignModal(work)}
                              className="w-full py-1.5 px-2 rounded-lg bg-[#1B2CC1] hover:bg-[#15239E] text-white text-[10px] sm:text-xs font-bold transition-all shadow-xs text-center cursor-pointer"
                            >
                              Assign
                            </button>
                          ) : work.status !== 'COMPLETED' ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenAssignModal(work)}
                                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] sm:text-xs font-semibold transition-all shadow-xs cursor-pointer text-center"
                              >
                                Squad
                              </button>
                              <span className="text-[9px] text-slate-400 font-medium px-1.5 py-1 rounded bg-slate-50 border border-slate-200 truncate">
                                In Progress
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEnquiryToPay(work);
                                setIsPayModalOpen(true);
                              }}
                              className={`w-full py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1 truncate ${
                                work.totalCalculatedWage
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              }`}
                            >
                              <IndianRupee className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                              <span className="truncate">
                                {work.totalCalculatedWage
                                  ? `Paid: ₹${work.totalCalculatedWage}`
                                  : 'Assign Pay'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredEnquiries.length === 0 && (
                    <div className="py-10 text-center text-slate-400 text-xs italic">
                      No work orders found for the selected filter.
                    </div>
                  )}
                </div>
              )}

              {/* 3. Assignments View */}
              {activeSection === 'operations-assignments' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Pending Works */}
                  <div className="bg-white rounded-2xl border border-white/80 p-5 space-y-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#091540] flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 text-[#1B2CC1]" />
                        <span>Pending Works</span>
                      </h3>
                      <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {enquiries.filter((e) => e.status === 'PENDING').length} unassigned
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
                      {enquiries
                        .filter((e) => e.status === 'PENDING')
                        .map((enq) => (
                          <div
                            key={enq.id}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-[#1B2CC1]/40 transition-colors space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[11px] font-mono font-bold text-[#1B2CC1]">
                                  {enq.trackingNumber}
                                </span>
                                <h4 className="text-xs font-bold text-[#091540] mt-0.5">
                                  {enq.serviceName}
                                </h4>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleOpenAssignModal(enq)}
                                className="px-2.5 py-1 rounded-lg bg-[#1B2CC1] hover:bg-[#15239E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                Dispatch
                              </button>
                            </div>
                            <div className="text-xs text-slate-600">
                              Customer: {enq.customerName} ({enq.customerPhone})
                            </div>
                            {enq.location && (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{enq.location}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      {enquiries.filter((e) => e.status === 'PENDING').length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-xs italic">
                          No pending works.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Available Workers */}
                  <div className="bg-white rounded-2xl border border-white/80 p-5 space-y-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#091540] flex items-center gap-2">
                        <HardHat className="w-4 h-4 text-[#1B2CC1]" />
                        <span>Available Workers</span>
                      </h3>
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {stats.availableWorkers} ready
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
                      {workers
                        .filter((w) => w.workerStatus === 'AVAILABLE')
                        .map((w) => (
                          <div
                            key={w.id}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#ABD2FA]/30 text-[#091540] font-bold flex items-center justify-center text-xs">
                                {w.name ? w.name.charAt(0) : 'W'}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-[#091540]">
                                  {w.name || w.username}
                                </h4>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                  <span>{w.phone || 'No phone'}</span>
                                  <span>&bull;</span>
                                  <span className="text-emerald-700 font-semibold">Available</span>
                                </div>
                              </div>
                            </div>

                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Available
                            </span>
                          </div>
                        ))}
                      {workers.filter((w) => w.workerStatus === 'AVAILABLE').length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-xs italic">
                          No workers currently available.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Services View */}
              {activeSection === 'operations-services' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SERVICES_CATALOG.map((svc) => (
                    <div
                      key={svc.id}
                      className="p-5 rounded-2xl bg-white border border-white/80 shadow-md hover:shadow-lg transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ABD2FA]/30 text-[#091540] border border-[#7692FF]/30">
                            {svc.category}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{svc.turnaround}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#091540]">
                          {svc.title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {svc.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Lead: {svc.squadLead}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateWorkModalOpen(true);
                          }}
                          className="text-[#1B2CC1] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>New Order</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {/* Section: Reports */}
          {activeSection === 'reports' && (
            <div className="bg-white rounded-2xl border border-white/80 p-6 space-y-6 shadow-md">
              <div>
                <h3 className="text-sm font-bold text-[#091540]">Operations Summary & Reports</h3>
                <p className="text-xs text-slate-500 mt-0.5">Overview of current period workloads</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Work Inflow</span>
                  <div className="text-2xl font-black text-[#091540] mt-1">{stats.totalEnquiries}</div>
                  <span className="text-xs text-slate-400 mt-1 block">All registered jobs</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Completed Jobs</span>
                  <div className="text-2xl font-black text-emerald-700 mt-1">{stats.completedEnquiries}</div>
                  <span className="text-xs text-emerald-600 font-medium mt-1 block">Successfully closed</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Worker Utilization</span>
                  <div className="text-2xl font-black text-[#1B2CC1] mt-1">
                    {stats.totalWorkers > 0
                      ? Math.round((stats.busyWorkers / stats.totalWorkers) * 100)
                      : 0}%
                  </div>
                  <span className="text-xs text-[#1B2CC1] font-medium mt-1 block">Currently on active tasks</span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Notifications */}
          {activeSection === 'notifications' && (
            <NotificationFeed
              token={token}
              isDark={false}
              title="Office Staff Dispatch Alerts &amp; System Notifications"
            />
          )}

          {/* Section: Activity Logs */}
          {activeSection === 'activity-logs' && (
            <ActivityFeed
              token={token}
              isDark={false}
              title="My Office Operations &amp; Activity Trail"
              subtitle="Immutable detailed record of enquiries created, staff check-ins, technician assignments, and cash entries"
              limit={20}
            />
          )}

          {/* Section: Announcements */}
          {activeSection === 'announcements' && (
            <div className="bg-white rounded-2xl border border-white/80 p-6 shadow-md">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#091540] flex items-center gap-2">
                  <Megaphone className="w-6 h-6 text-[#1B2CC1]" />
                  Notices &amp; Announcements
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Important operational updates and notices
                </p>
              </div>
              <div className="max-w-4xl">
                <AnnouncementsList />
              </div>
            </div>
          )}

          {/* Section: Settings */}
          {activeSection === 'settings' && (
            <div className="bg-white rounded-2xl border border-white/80 p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-[#091540]">Desk Settings</h3>
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#091540]">Account Profile & Security</div>
                    <div className="text-slate-500">Signed in as {user?.name || user?.username} ({user?.role})</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                    <button
                      type="button"
                      onClick={() => router.push('/office-staff/profile')}
                      className="px-3 py-1.5 rounded-lg bg-[#1B2CC1] hover:bg-[#15239E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCircle className="w-3.5 h-3.5" />
                      <span>Manage Profile</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#091540]">Desk Availability</div>
                    <div className="text-slate-500">Current presence: {isAvailable ? 'Available' : 'Unavailable'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenToggleModal}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#091540] text-xs font-semibold border border-slate-200 transition-colors shadow-xs"
                  >
                    Change Status
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <StaffAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        onConfirm={handleConfirmAttendance}
        isLoading={isTogglingAvailability}
        userName={user?.name || user?.username || 'Office Staff'}
        mode={attendanceModalMode}
        currentStatus={isAvailable ? 'AVAILABLE' : 'OFF_DUTY'}
      />

      <CreateWorkModal
        isOpen={isCreateWorkModalOpen}
        onClose={() => setIsCreateWorkModalOpen(false)}
        onCreated={(msg) => {
          showToast(msg);
          loadDashboardData();
        }}
        token={token}
        workers={workers}
      />

      {selectedEnquiryToAssign && (
        <AssignWorkerModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedEnquiryToAssign(null);
          }}
          onAssignedSuccess={() => {
            showToast('Worker assigned successfully');
            loadDashboardData();
          }}
          enquiry={selectedEnquiryToAssign}
          workers={workers}
          token={token || undefined}
        />
      )}

      {selectedEnquiryToPay && (
        <UpdateJobPayModal
          isOpen={isPayModalOpen}
          onClose={() => {
            setIsPayModalOpen(false);
            setSelectedEnquiryToPay(null);
          }}
          enquiry={selectedEnquiryToPay}
          token={token || undefined}
          onPayUpdatedSuccess={() => {
            showToast('Worker pay updated successfully');
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
}
