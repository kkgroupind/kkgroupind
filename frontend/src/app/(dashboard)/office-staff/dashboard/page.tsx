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
} from 'lucide-react';
import {
  AttendanceService,
  EnquiryService,
  ServiceEnquiry,
  WorkerWithAvailability,
  WorkerStatus,
  User,
  peopleService,
} from '@/services';
import {
  OfficeStaffSidebar,
  OfficeStaffSection,
  StaffAttendanceModal,
  AssignWorkerModal,
  CreateWorkModal,
} from '@/components/OfficeStaff';

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

  // Core Data State
  const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>([]);
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [people, setPeople] = useState<User[]>([]);
  const [attendanceOverview, setAttendanceOverview] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

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
      availableWorkers,
      busyWorkers,
      offDutyWorkers,
      totalWorkers: workers.length,
    };
  }, [enquiries, workers]);

  // Filtered Enquiries / Works
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerPhone.includes(searchQuery);

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [enquiries, searchQuery, statusFilter]);

  // People Lists
  const customersList = useMemo(() => people.filter((p) => p.role === 'CUSTOMER'), [people]);
  const workersList = useMemo(() => workers, [workers]);

  return (
    <div className="min-h-screen bg-[#0D0E12] text-gray-200 flex font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#14161D] text-gray-100 px-4 py-2.5 rounded-xl shadow-xl border border-gray-700 flex items-center gap-2.5 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Sidebar */}
      <OfficeStaffSidebar
        activeSection={activeSection}
        onSelectSection={(sec) => setActiveSection(sec)}
        isAvailable={isAvailable}
        onToggleAvailability={handleOpenToggleModal}
        userName={user?.name || user?.username || 'Office Staff'}
        userRole={user?.role || 'OFFICE_STAFF'}
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
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 bg-[#0D0E12]">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#0D0E12]/95 backdrop-blur border-b border-gray-800 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-gray-500 font-medium">
                Office Staff Portal
              </span>
              <h1 className="text-sm sm:text-base font-semibold text-gray-100 tracking-tight truncate capitalize">
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
              className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                isAvailable
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>{isAvailable ? 'Available' : 'Unavailable'}</span>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => {
                loadDashboardData();
                showToast('Data refreshed');
              }}
              disabled={isLoadingData}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700/60 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Create Work Order Button */}
            <button
              type="button"
              onClick={() => setIsCreateWorkModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Work</span>
            </button>
          </div>
        </header>

        {/* Dynamic Section Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Section: Dashboard */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveSection('operations-enquiries')}
                  className="p-5 rounded-xl bg-[#14161D] border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-gray-400 mb-3">
                    <span className="text-xs font-medium">Pending Enquiries</span>
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300">
                      <FolderKanban className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-100">
                    {stats.pendingEnquiries}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {stats.totalEnquiries} total requests
                  </span>
                </div>

                <div
                  onClick={() => setActiveSection('operations-works')}
                  className="p-5 rounded-xl bg-[#14161D] border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-gray-400 mb-3">
                    <span className="text-xs font-medium">Active Works</span>
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300">
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-100">
                    {stats.activeWorks}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    Assigned and in progress
                  </span>
                </div>

                <div
                  onClick={() => setActiveSection('workforce-availability')}
                  className="p-5 rounded-xl bg-[#14161D] border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-gray-400 mb-3">
                    <span className="text-xs font-medium">Available Workers</span>
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300">
                      <HardHat className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {stats.availableWorkers}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {stats.busyWorkers} busy &bull; {stats.offDutyWorkers} away
                  </span>
                </div>

                <div
                  onClick={handleOpenToggleModal}
                  className="p-5 rounded-xl bg-[#14161D] border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-gray-400 mb-3">
                    <span className="text-xs font-medium">Desk Presence</span>
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-100 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <span>{isAvailable ? 'Available' : 'Unavailable'}</span>
                  </div>
                  <span className="text-xs text-blue-400 font-medium mt-1 block">
                    Click to change status
                  </span>
                </div>
              </div>

              {/* Action Banner */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#14161D] border border-gray-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-100">
                    Operations Dispatch Desk
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Directly create work orders, assign available workers, or review incoming requests.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCreateWorkModalOpen(true)}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Work</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('operations-assignments')}
                    className="px-3.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-gray-700/60"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Assignments</span>
                  </button>
                </div>
              </div>

              {/* Recent Works Table */}
              <div className="bg-[#14161D] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-100">
                    Recent Works & Enquiries
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSection('operations-works')}
                    className="text-xs font-medium text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#0D0E12] text-gray-400 font-medium border-b border-gray-800">
                      <tr>
                        <th className="py-2.5 px-4">Tracking Code</th>
                        <th className="py-2.5 px-4">Customer</th>
                        <th className="py-2.5 px-4">Service</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Assigned Worker</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredEnquiries.slice(0, 8).map((job) => (
                        <tr key={job.id} className="hover:bg-[#1A1C23]/60 transition-colors">
                          <td className="py-2.5 px-4 font-mono font-medium text-gray-200">
                            {job.trackingNumber}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-medium text-gray-100">{job.customerName}</div>
                            <div className="text-[11px] text-gray-500">{job.customerPhone}</div>
                          </td>
                          <td className="py-2.5 px-4 text-gray-300 max-w-xs truncate">
                            {job.serviceName}
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                                job.status === 'COMPLETED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : job.status === 'IN_PROGRESS'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : job.status === 'ASSIGNED'
                                  ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            {job.worker ? (
                              <span className="font-medium text-gray-200">
                                {job.worker.name || job.worker.username}
                              </span>
                            ) : (
                              <span className="text-gray-500 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            {job.status === 'PENDING' ? (
                              <button
                                type="button"
                                onClick={() => handleOpenAssignModal(job)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                              >
                                Assign
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setActiveSection('operations-works')}
                                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors"
                              >
                                View
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Section: People */}
          {activeSection.startsWith('people') && (
            <div className="space-y-6">
              {/* People Subtabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#14161D] rounded-xl border border-gray-800 w-fit text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveSection('people-customers')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeSection === 'people-customers'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Customers ({customersList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('people-workers')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeSection === 'people-workers'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Workers ({workersList.length})
                </button>
              </div>

              {/* Customers View */}
              {activeSection === 'people-customers' && (
                <div className="bg-[#14161D] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-100">Customer Directory</h3>
                    <span className="text-xs text-gray-400">{customersList.length} clients</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#0D0E12] text-gray-400 font-medium border-b border-gray-800">
                        <tr>
                          <th className="py-2.5 px-4">Name</th>
                          <th className="py-2.5 px-4">Email</th>
                          <th className="py-2.5 px-4">Phone</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4">Registered Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {customersList.map((customer) => (
                          <tr key={customer.id} className="hover:bg-[#1A1C23]/60 transition-colors">
                            <td className="py-2.5 px-4 font-medium text-gray-100">{customer.name || customer.username}</td>
                            <td className="py-2.5 px-4 text-gray-300">{customer.email || '—'}</td>
                            <td className="py-2.5 px-4 text-gray-300">{customer.phone || '—'}</td>
                            <td className="py-2.5 px-4">
                              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Active
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-gray-400">
                              {new Date(customer.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Workers View */}
              {activeSection === 'people-workers' && (
                <div className="bg-[#14161D] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-100">Workers Directory</h3>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-emerald-400 font-medium">{stats.availableWorkers} Available</span>
                      <span className="text-gray-600">&bull;</span>
                      <span className="text-amber-400 font-medium">{stats.busyWorkers} Busy</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#0D0E12] text-gray-400 font-medium border-b border-gray-800">
                        <tr>
                          <th className="py-2.5 px-4">Name</th>
                          <th className="py-2.5 px-4">Username</th>
                          <th className="py-2.5 px-4">Phone</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4">Active Assignments</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {workersList.map((worker) => (
                          <tr key={worker.id} className="hover:bg-[#1A1C23]/60 transition-colors">
                            <td className="py-2.5 px-4 font-medium text-gray-100">{worker.name || worker.username}</td>
                            <td className="py-2.5 px-4 font-mono text-gray-400">@{worker.username}</td>
                            <td className="py-2.5 px-4 text-gray-300">{worker.phone || '—'}</td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                                  worker.workerStatus === 'AVAILABLE'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : worker.workerStatus === 'BUSY'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    worker.workerStatus === 'AVAILABLE'
                                      ? 'bg-emerald-500'
                                      : worker.workerStatus === 'BUSY'
                                      ? 'bg-blue-500'
                                      : 'bg-gray-500'
                                  }`}
                                />
                                {worker.workerStatus}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-medium text-gray-300">
                              {worker._count?.workerAssignments ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section: Operations */}
          {activeSection.startsWith('operations') && (
            <div className="space-y-6">
              {/* Operations Subtabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#14161D] rounded-xl border border-gray-800 w-fit text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveSection('operations-enquiries')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeSection === 'operations-enquiries'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Enquiries ({stats.pendingEnquiries})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('operations-works')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeSection === 'operations-works'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Works ({enquiries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('operations-assignments')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeSection === 'operations-assignments'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Assignments
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('operations-services')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeSection === 'operations-services'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Services ({SERVICES_CATALOG.length})
                </button>
              </div>

              {/* 1. Enquiries View */}
              {activeSection === 'operations-enquiries' && (
                <div className="bg-[#14161D] rounded-xl border border-gray-800 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-100">Pending Customer Enquiries</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        New requests waiting for worker assignment.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCreateWorkModalOpen(true)}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Work</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#0D0E12] text-gray-400 font-medium border-b border-gray-800">
                        <tr>
                          <th className="py-2.5 px-4">Tracking Code</th>
                          <th className="py-2.5 px-4">Customer</th>
                          <th className="py-2.5 px-4">Service</th>
                          <th className="py-2.5 px-4">Requirements</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {enquiries
                          .filter((e) => e.status === 'PENDING')
                          .map((enquiry) => (
                            <tr key={enquiry.id} className="hover:bg-[#1A1C23]/60 transition-colors">
                              <td className="py-2.5 px-4 font-mono font-medium text-emerald-400">
                                {enquiry.trackingNumber}
                              </td>
                              <td className="py-2.5 px-4">
                                <div className="font-medium text-gray-100">{enquiry.customerName}</div>
                                <div className="text-[11px] text-gray-500">{enquiry.customerPhone}</div>
                              </td>
                              <td className="py-2.5 px-4 text-gray-300">{enquiry.serviceName}</td>
                              <td className="py-2.5 px-4 text-gray-400 max-w-xs truncate">
                                {enquiry.message}
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  PENDING
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssignModal(enquiry)}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                                >
                                  Assign Worker
                                </button>
                              </td>
                            </tr>
                          ))}
                        {enquiries.filter((e) => e.status === 'PENDING').length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                              No pending enquiries.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. Works View */}
              {activeSection === 'operations-works' && (
                <div className="bg-[#14161D] rounded-xl border border-gray-800 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-100">All Work Orders</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Overview of all works created directly or through enquiries.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCreateWorkModalOpen(true)}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Work Order</span>
                    </button>
                  </div>

                  {/* Status Filters */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] as const).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            statusFilter === st
                              ? 'bg-gray-800 text-white border border-gray-700'
                              : 'bg-[#0D0E12] text-gray-400 hover:text-white border border-gray-800'
                          }`}
                        >
                          {st}
                        </button>
                      ),
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#0D0E12] text-gray-400 font-medium border-b border-gray-800">
                        <tr>
                          <th className="py-2.5 px-4">Code</th>
                          <th className="py-2.5 px-4">Service</th>
                          <th className="py-2.5 px-4">Customer</th>
                          <th className="py-2.5 px-4">Worker</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {filteredEnquiries.map((work) => (
                          <tr key={work.id} className="hover:bg-[#1A1C23]/60 transition-colors">
                            <td className="py-2.5 px-4 font-mono font-medium text-gray-200">
                              {work.trackingNumber}
                            </td>
                            <td className="py-2.5 px-4 text-gray-200 font-medium">
                              {work.serviceName}
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="text-gray-100 font-medium">{work.customerName}</div>
                              <div className="text-[11px] text-gray-500">{work.customerPhone}</div>
                            </td>
                            <td className="py-2.5 px-4">
                              {work.worker ? (
                                <span className="font-medium text-gray-200">
                                  {work.worker.name || work.worker.username}
                                </span>
                              ) : (
                                <span className="text-amber-400 text-[11px] font-medium">Unassigned</span>
                              )}
                            </td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                  work.status === 'COMPLETED'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : work.status === 'IN_PROGRESS'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : work.status === 'ASSIGNED'
                                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                              >
                                {work.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              {!work.worker ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssignModal(work)}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                                >
                                  Assign
                                </button>
                              ) : (
                                <span className="text-xs text-gray-500">Assigned</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. Assignments View */}
              {activeSection === 'operations-assignments' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Pending Works */}
                  <div className="bg-[#14161D] rounded-xl border border-gray-800 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 text-amber-400" />
                        <span>Pending Works</span>
                      </h3>
                      <span className="text-xs text-amber-400 font-medium">
                        {enquiries.filter((e) => e.status === 'PENDING').length} unassigned
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
                      {enquiries
                        .filter((e) => e.status === 'PENDING')
                        .map((enq) => (
                          <div
                            key={enq.id}
                            className="p-3.5 rounded-lg bg-[#0D0E12] border border-gray-800 hover:border-gray-700 transition-colors space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[11px] font-mono font-medium text-emerald-400">
                                  {enq.trackingNumber}
                                </span>
                                <h4 className="text-xs font-medium text-gray-100 mt-0.5">
                                  {enq.serviceName}
                                </h4>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleOpenAssignModal(enq)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                              >
                                Dispatch
                              </button>
                            </div>
                            <div className="text-xs text-gray-300">
                              Customer: {enq.customerName} ({enq.customerPhone})
                            </div>
                            {enq.location && (
                              <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-600" />
                                <span>{enq.location}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      {enquiries.filter((e) => e.status === 'PENDING').length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-xs italic">
                          No pending works.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Available Workers */}
                  <div className="bg-[#14161D] rounded-xl border border-gray-800 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                        <HardHat className="w-4 h-4 text-emerald-400" />
                        <span>Available Workers</span>
                      </h3>
                      <span className="text-xs text-emerald-400 font-medium">
                        {stats.availableWorkers} ready
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
                      {workers
                        .filter((w) => w.workerStatus === 'AVAILABLE')
                        .map((w) => (
                          <div
                            key={w.id}
                            className="p-3.5 rounded-lg bg-[#0D0E12] border border-gray-800 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-800 text-gray-300 font-medium flex items-center justify-center text-xs">
                                {w.name ? w.name.charAt(0) : 'W'}
                              </div>
                              <div>
                                <h4 className="text-xs font-medium text-gray-100">
                                  {w.name || w.username}
                                </h4>
                                <div className="text-[11px] text-gray-500 flex items-center gap-2">
                                  <span>{w.phone || 'No phone'}</span>
                                  <span>&bull;</span>
                                  <span className="text-emerald-400">Available</span>
                                </div>
                              </div>
                            </div>

                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Available
                            </span>
                          </div>
                        ))}
                      {workers.filter((w) => w.workerStatus === 'AVAILABLE').length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-xs italic">
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
                      className="p-5 rounded-xl bg-[#14161D] border border-gray-800 hover:border-gray-700 transition-colors flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                            {svc.category}
                          </span>
                          <span className="text-xs text-gray-500">{svc.turnaround}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-100">
                          {svc.title}
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {svc.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                        <span className="text-gray-500">Lead: {svc.squadLead}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateWorkModalOpen(true);
                          }}
                          className="text-blue-400 hover:underline font-medium flex items-center gap-1"
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

          {/* Section: Workforce */}
          {activeSection.startsWith('workforce') && (
            <div className="space-y-6">
              {/* Workforce Subtabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#14161D] rounded-xl border border-gray-800 w-fit text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveSection('workforce-attendance')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeSection === 'workforce-attendance'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Attendance
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('workforce-availability')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeSection === 'workforce-availability'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Availability ({stats.availableWorkers} Available)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('workforce-leave')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeSection === 'workforce-leave'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Leave Records ({stats.offDutyWorkers})
                </button>
              </div>

              {/* 1. Attendance View */}
              {activeSection === 'workforce-attendance' && (
                <div className="bg-[#14161D] rounded-xl border border-gray-800 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-100">Daily Attendance</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Presence records for {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenToggleModal}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isAvailable
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isAvailable ? 'Mark as Away' : 'Mark as Available'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Office Staff Attendance */}
                    <div className="p-4 rounded-xl bg-[#0D0E12] border border-gray-800">
                      <h4 className="text-xs font-semibold text-gray-300 mb-3">Office Staff</h4>
                      <div className="space-y-2">
                        {attendanceOverview?.officeStaff?.map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-800/60">
                            <span className="font-medium text-gray-200">{s.name || s.username}</span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              s.isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-400'
                            }`}>
                              {s.isAvailable ? 'Available' : 'Away'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Workers Attendance */}
                    <div className="p-4 rounded-xl bg-[#0D0E12] border border-gray-800">
                      <h4 className="text-xs font-semibold text-gray-300 mb-3">Field Workers</h4>
                      <div className="space-y-2">
                        {attendanceOverview?.workers?.map((w: any) => (
                          <div key={w.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-800/60">
                            <span className="font-medium text-gray-200">{w.name || w.username}</span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              w.workerStatus === 'AVAILABLE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : w.workerStatus === 'BUSY'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-gray-800 text-gray-400'
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

              {/* 2. Availability View */}
              {activeSection === 'workforce-availability' && (
                <div className="bg-[#14161D] rounded-xl border border-gray-800 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-100">Live Worker Availability</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {workers.map((worker) => (
                      <div
                        key={worker.id}
                        className={`p-3.5 rounded-lg border transition-colors ${
                          worker.workerStatus === 'AVAILABLE'
                            ? 'bg-[#0D0E12] border-emerald-500/30'
                            : worker.workerStatus === 'BUSY'
                            ? 'bg-[#0D0E12] border-blue-500/30'
                            : 'bg-[#0D0E12] border-gray-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-gray-200">
                            {worker.name || worker.username}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              worker.workerStatus === 'AVAILABLE'
                                ? 'bg-emerald-500'
                                : worker.workerStatus === 'BUSY'
                                ? 'bg-blue-500'
                                : 'bg-gray-600'
                            }`}
                          />
                        </div>
                        <div className="text-[11px] text-gray-500 mb-2">
                          {worker.phone || 'No phone'}
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-800">
                          <span className="text-gray-500">Status:</span>
                          <span className={
                            worker.workerStatus === 'AVAILABLE' ? 'text-emerald-400 font-medium' : 'text-gray-400'
                          }>
                            {worker.workerStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Leave View */}
              {activeSection === 'workforce-leave' && (
                <div className="bg-[#14161D] rounded-xl border border-gray-800 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-100">Personnel on Leave</h3>
                  <div className="space-y-2">
                    {workers
                      .filter((w) => w.workerStatus === 'OFF_DUTY')
                      .map((w) => (
                        <div
                          key={w.id}
                          className="p-3.5 rounded-lg bg-[#0D0E12] border border-gray-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-medium text-gray-200">{w.name || w.username}</span>
                            <div className="text-[11px] text-gray-500">Phone: {w.phone || '—'}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-800 text-gray-400 border border-gray-700">
                            Off Duty
                          </span>
                        </div>
                      ))}
                    {workers.filter((w) => w.workerStatus === 'OFF_DUTY').length === 0 && (
                      <div className="p-8 text-center text-gray-500 text-xs italic">
                        No personnel on leave today.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section: Reports */}
          {activeSection === 'reports' && (
            <div className="bg-[#14161D] rounded-xl border border-gray-800 p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-100">Operations Summary & Reports</h3>
                <p className="text-xs text-gray-400 mt-0.5">Overview of current period workloads</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#0D0E12] border border-gray-800">
                  <span className="text-xs text-gray-500 font-medium">Total Work Inflow</span>
                  <div className="text-2xl font-bold text-gray-100 mt-1">{stats.totalEnquiries}</div>
                  <span className="text-xs text-gray-500 mt-1 block">All registered jobs</span>
                </div>
                <div className="p-4 rounded-lg bg-[#0D0E12] border border-gray-800">
                  <span className="text-xs text-gray-500 font-medium">Completed Jobs</span>
                  <div className="text-2xl font-bold text-gray-100 mt-1">{stats.completedEnquiries}</div>
                  <span className="text-xs text-emerald-400 mt-1 block">Successfully closed</span>
                </div>
                <div className="p-4 rounded-lg bg-[#0D0E12] border border-gray-800">
                  <span className="text-xs text-gray-500 font-medium">Worker Utilization</span>
                  <div className="text-2xl font-bold text-gray-100 mt-1">
                    {stats.totalWorkers > 0
                      ? Math.round((stats.busyWorkers / stats.totalWorkers) * 100)
                      : 0}%
                  </div>
                  <span className="text-xs text-blue-400 mt-1 block">Currently on active tasks</span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Notifications */}
          {activeSection === 'notifications' && (
            <div className="bg-[#14161D] rounded-xl border border-gray-800 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-100">Notifications</h3>
              <div className="space-y-2.5">
                {enquiries.slice(0, 5).map((enq) => (
                  <div
                    key={enq.id}
                    className="p-3.5 rounded-lg bg-[#0D0E12] border border-gray-800 flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                      <FolderKanban className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="font-medium text-gray-200">
                        {enq.serviceName}
                      </div>
                      <div className="text-gray-400 mt-0.5">
                        Customer {enq.customerName} requested service at {enq.location || 'Local Site'}.
                      </div>
                      <span className="text-[11px] text-gray-500 font-mono mt-1 block">
                        Tracking ID: {enq.trackingNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Activity Logs */}
          {activeSection === 'activity-logs' && (
            <div className="bg-[#14161D] rounded-xl border border-gray-800 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-100">Activity Logs</h3>
              <div className="space-y-2 font-mono text-xs">
                {enquiries.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-[#0D0E12] border border-gray-800 flex items-center justify-between text-gray-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">[DISPATCH]</span>
                      <span>Ticket {item.trackingNumber} status is {item.status}</span>
                    </div>
                    <span className="text-[11px] text-gray-500">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Settings */}
          {activeSection === 'settings' && (
            <div className="bg-[#14161D] rounded-xl border border-gray-800 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-100">Desk Settings</h3>
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-lg bg-[#0D0E12] border border-gray-800 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-200">Account Profile</div>
                    <div className="text-gray-500">Signed in as {user?.name || user?.username} ({user?.role})</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-[#0D0E12] border border-gray-800 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-200">Desk Availability</div>
                    <div className="text-gray-500">Current presence: {isAvailable ? 'Available' : 'Unavailable'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenToggleModal}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700/60 transition-colors"
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
    </div>
  );
}
