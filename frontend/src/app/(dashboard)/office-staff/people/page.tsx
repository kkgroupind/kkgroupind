'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import {
  officeStaffPeopleService,
  OfficeStaffCreatePersonData,
  OfficeStaffUpdatePersonData,
  User,
} from '@/services';
import {
  HardHat,
  UserCircle,
  Plus,
  Search,
  RefreshCw,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Edit2,
  ArrowLeft,
  Briefcase,
  Activity,
  Coffee,
  MessageCircle,
  Menu,
} from 'lucide-react';
import { OfficeStaffSidebar, OfficeStaffLoadingScreen } from '@/components/OfficeStaff';

export default function OfficeStaffPeoplePage() {
  const { token, user: authUser, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  // State
  const [workers, setWorkers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'BUSY' | 'OFF_DUTY'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<User | null>(null);

  // Create Form State (Always WORKER)
  const [createName, setCreateName] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Username validation for Create modal
  const [createUsernameStatus, setCreateUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const [createUsernameSuggestions, setCreateUsernameSuggestions] = useState<string[]>([]);
  const usernameDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWorkerStatus, setEditWorkerStatus] = useState<'AVAILABLE' | 'BUSY' | 'OFF_DUTY'>('AVAILABLE');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Auth check
  useEffect(() => {
    if (!authLoading) {
      if (!token || (authUser?.role !== 'OFFICE_STAFF' && authUser?.role !== 'SUPER_ADMIN')) {
        router.push('/office-staff/login');
        return;
      }
      loadWorkers();
    }
  }, [authLoading, token, authUser, router]);

  // 2. Fetch field workers list
  const loadWorkers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await officeStaffPeopleService.listPeople(token, {
        role: 'WORKER',
        limit: 100,
      });
      // Ensure only workers are kept
      const workerList = (res.data || []).filter((u) => u.role === 'WORKER');
      setWorkers(workerList);
    } catch (err: any) {
      console.error('Failed to load workers:', err);
      setErrorMessage(err?.message || 'Failed to load field workers directory');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // 3. Username Availability Check in Create Modal
  useEffect(() => {
    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }

    const clean = createUsername.trim().toLowerCase();
    if (!clean) {
      setCreateUsernameStatus('idle');
      setCreateUsernameSuggestions([]);
      return;
    }

    if (clean.length < 3) {
      setCreateUsernameStatus('taken');
      return;
    }

    setCreateUsernameStatus('checking');
    usernameDebounceRef.current = setTimeout(async () => {
      if (!token) return;
      try {
        const res = await officeStaffPeopleService.checkUsername(clean, token);
        if (res.isAvailable) {
          setCreateUsernameStatus('available');
          setCreateUsernameSuggestions([]);
        } else {
          setCreateUsernameStatus('taken');
          setCreateUsernameSuggestions(res.suggestions || []);
        }
      } catch (err) {
        setCreateUsernameStatus('idle');
      }
    }, 450);

    return () => {
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current);
      }
    };
  }, [createUsername, token]);

  // 4. Handle Create Worker
  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!createName.trim() || !createPhone.trim() || !createUsername.trim() || !createPassword.trim()) {
      setErrorMessage('Please fill in all mandatory fields');
      return;
    }

    if (createUsernameStatus === 'taken') {
      setErrorMessage('Please pick an available username');
      return;
    }

    setIsSubmittingCreate(true);
    setErrorMessage(null);

    try {
      const payload: OfficeStaffCreatePersonData = {
        name: createName.trim(),
        mobileNumber: createPhone.trim(),
        username: createUsername.trim().toLowerCase(),
        password: createPassword,
        role: 'WORKER',
        email: createEmail.trim() || undefined,
      };

      await officeStaffPeopleService.createPerson(payload, token);
      showToast('Field Worker created successfully!');
      setIsCreateModalOpen(false);
      // Reset form
      setCreateName('');
      setCreateUsername('');
      setCreatePhone('');
      setCreateEmail('');
      setCreatePassword('');
      loadWorkers();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create worker account');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // 5. Open Edit Modal
  const openEditModal = (worker: User) => {
    setSelectedWorker(worker);
    setEditName(worker.name || '');
    setEditPhone(worker.phone || '');
    setEditEmail(worker.email || '');
    setEditWorkerStatus(worker.workerStatus || 'AVAILABLE');
    setIsEditModalOpen(true);
  };

  // 6. Handle Edit Save
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedWorker) return;

    setIsSubmittingEdit(true);
    try {
      const payload: OfficeStaffUpdatePersonData = {
        name: editName.trim(),
        mobileNumber: editPhone.trim() || undefined,
        email: editEmail.trim() || undefined,
        workerStatus: editWorkerStatus,
      };

      await officeStaffPeopleService.updatePerson(selectedWorker.id, payload, token);
      showToast('Worker details updated successfully!');
      setIsEditModalOpen(false);
      loadWorkers();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update worker record');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // 7. Quick Status Update
  const handleQuickStatusChange = async (workerId: string, newStatus: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY') => {
    if (!token) return;
    try {
      await officeStaffPeopleService.updatePerson(workerId, { workerStatus: newStatus }, token);
      setWorkers((prev) =>
        prev.map((w) => (w.id === workerId ? { ...w, workerStatus: newStatus } : w))
      );
      showToast(`Status updated to ${newStatus}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update worker status');
    }
  };

  // Filtered List
  const filteredWorkers = workers.filter((w) => {
    if (statusFilter !== 'ALL' && w.workerStatus !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = w.name?.toLowerCase().includes(term);
      const matchUsername = w.username?.toLowerCase().includes(term);
      const matchPhone = w.phone?.toLowerCase().includes(term);
      const matchEmail = w.email?.toLowerCase().includes(term);
      return matchName || matchUsername || matchPhone || matchEmail;
    }
    return true;
  });

  const totalWorkersCount = workers.length;
  const availableWorkersCount = workers.filter((w) => w.workerStatus === 'AVAILABLE').length;
  const busyWorkersCount = workers.filter((w) => w.workerStatus === 'BUSY').length;
  const offDutyWorkersCount = workers.filter((w) => w.workerStatus === 'OFF_DUTY').length;

  if (authLoading || (isLoading && workers.length === 0)) {
    return (
      <OfficeStaffLoadingScreen
        title="Loading Field Workers & Workforce..."
        subtitle="ഫീൽഡ് വർക്കേഴ്സ് & ലൈവ് സ്റ്റാറ്റസ് • ഡയറക്ടറി"
        statusText="Synchronizing worker records and live availability..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#ABD2FA] text-slate-800 flex">
      {/* Navigation Sidebar */}
      <OfficeStaffSidebar
        activeSection="people-workers"
        onSelectSection={(sec) => {
          if (sec === 'profile') {
            router.push('/office-staff/profile');
            return;
          }
          if (sec === 'people-workers') {
            // Already here
            return;
          }
          router.push(`/office-staff/dashboard?section=${sec}`);
        }}
        userName={authUser?.name || authUser?.username || 'Office Staff'}
        userRole={authUser?.role || 'OFFICE_STAFF'}
        userAvatar={authUser?.avatar}
        availableWorkersCount={availableWorkersCount}
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
        {/* Top Header */}
        <header className="border-b border-[#7692FF]/30 bg-white/90 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-[#091540]"
            >
              <Menu className="w-4 h-4" />
            </button>
            <Link
              href="/office-staff/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#091540] transition-all text-xs font-semibold border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Desk</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-[#091540] tracking-tight">
                  Field Workers &amp; Workforce
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#1B2CC1]/10 text-[#1B2CC1] border border-[#1B2CC1]/30">
                  OFFICE STAFF
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                ഫീൽഡ് വർക്കേഴ്സ് & ലൈവ് സ്റ്റാറ്റസ് • Kerala Operations
              </span>
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1B2CC1] hover:bg-[#15239E] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Worker</span>
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Summary Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl border border-white/80 shadow-md p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Total Workers</span>
                <div className="text-xl font-black text-[#091540] mt-0.5">{totalWorkersCount}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#1B2CC1]/10 text-[#1B2CC1] flex items-center justify-center border border-[#1B2CC1]/20">
                <HardHat className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-white/80 shadow-md p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Available</span>
                <div className="text-xl font-black text-emerald-700 mt-0.5">{availableWorkersCount}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-white/80 shadow-md p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Busy on Site</span>
                <div className="text-xl font-black text-blue-700 mt-0.5">{busyWorkersCount}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-white/80 shadow-md p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Off Duty / Leave</span>
                <div className="text-xl font-black text-slate-700 mt-0.5">{offDutyWorkersCount}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center border border-slate-500/20">
                <Coffee className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter and Search Controls */}
          <div className="bg-white rounded-2xl border border-white/80 shadow-md p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex-1 sm:flex-initial ${
                  statusFilter === 'ALL'
                    ? 'bg-[#1B2CC1] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#091540]'
                }`}
              >
                All Workers ({totalWorkersCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('AVAILABLE')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex-1 sm:flex-initial ${
                  statusFilter === 'AVAILABLE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Available ({availableWorkersCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('BUSY')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex-1 sm:flex-initial ${
                  statusFilter === 'BUSY'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                Busy ({busyWorkersCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('OFF_DUTY')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex-1 sm:flex-initial ${
                  statusFilter === 'OFF_DUTY'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Off Duty ({offDutyWorkersCount})
              </button>
            </div>

            {/* Search Box & Refresh */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name, phone, @user..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1B2CC1]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={loadWorkers}
                title="Refresh Directory"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#091540] transition-colors border border-slate-200"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#1B2CC1]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Workers Table */}
          <div className="bg-white rounded-2xl border border-white/80 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Field Worker</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Availability Status</th>
                    <th className="py-3 px-4">Active Assignments</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1B2CC1] mb-2" />
                        Loading Field Worker records...
                      </td>
                    </tr>
                  ) : filteredWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        No field workers found matching the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredWorkers.map((worker) => {
                      const assignmentCount = (worker as any)?._count?.workerAssignments || 0;

                      return (
                        <tr key={worker.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Worker Name & Username */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[#091540] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                {(worker.name || worker.username || 'W').charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-[#091540] truncate">
                                  {worker.name || worker.username}
                                </span>
                                <span className="font-mono text-[11px] text-[#1B2CC1]">
                                  @{worker.username}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-0.5">
                              {worker.phone ? (
                                <div className="flex items-center gap-1.5 text-slate-700">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{worker.phone}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">No phone</span>
                              )}
                              {worker.email && (
                                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span className="truncate max-w-[140px]">{worker.email}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Live Status Pill & Quick Switch */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={worker.workerStatus || 'AVAILABLE'}
                                onChange={(e) =>
                                  handleQuickStatusChange(
                                    worker.id,
                                    e.target.value as 'AVAILABLE' | 'BUSY' | 'OFF_DUTY',
                                  )
                                }
                                className={`text-[11px] font-semibold py-1 px-2.5 rounded-full border cursor-pointer focus:outline-none transition-colors ${
                                  worker.workerStatus === 'AVAILABLE'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : worker.workerStatus === 'BUSY'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                <option value="AVAILABLE">&#9679; Available</option>
                                <option value="BUSY">&#9679; Busy</option>
                                <option value="OFF_DUTY">&#9679; Off Duty</option>
                              </select>
                            </div>
                          </td>

                          {/* Active Assignments */}
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#091540] mr-1.5">
                              {assignmentCount}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              jobs
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {worker.phone && (
                                <a
                                  href={`https://wa.me/${worker.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="WhatsApp Worker"
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => openEditModal(worker)}
                                title="Edit Worker Details"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#091540] transition-colors border border-slate-200"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* CREATE WORKER MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#7692FF]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-[#091540]">Register Field Worker</h3>
                  <p className="text-[11px] text-slate-500">
                    Onboard a new field technician or worker for Kerala operations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-[#091540]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateWorker} className="space-y-3.5 mt-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Radhakrishnan V."
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl px-3 py-2 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1B2CC1]"
                  />
                </div>

                {/* Username with live check */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-slate-700">Username *</label>
                    {createUsernameStatus === 'checking' && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> Checking...
                      </span>
                    )}
                    {createUsernameStatus === 'available' && (
                      <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Available
                      </span>
                    )}
                    {createUsernameStatus === 'taken' && (
                      <span className="text-[10px] text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" /> Already in use
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value)}
                    placeholder="e.g. radha_worker"
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl px-3 py-2 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1B2CC1]"
                  />
                  {createUsernameSuggestions.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500 pt-1">
                      <span>Suggestions:</span>
                      {createUsernameSuggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setCreateUsername(sug)}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 hover:text-[#091540] border border-slate-200"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Mobile Phone *</label>
                  <input
                    type="tel"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="+91 98460 00000"
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl px-3 py-2 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1B2CC1]"
                  />
                </div>

                {/* Email (Optional) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="worker@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl px-3 py-2 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1B2CC1]"
                  />
                </div>

                {/* Temporary Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Initial Password *</label>
                  <input
                    type="password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl px-3 py-2 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1B2CC1]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCreate || createUsernameStatus === 'taken'}
                    className="px-4 py-2 rounded-xl bg-[#1B2CC1] hover:bg-[#15239E] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    {isSubmittingCreate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Register Worker</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT WORKER MODAL */}
        {isEditModalOpen && selectedWorker && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#7692FF]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-[#091540]">Edit Worker Details</h3>
                  <p className="text-[11px] text-slate-500">
                    Update info and availability for @{selectedWorker.username}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-[#091540]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5 mt-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl px-3 py-2 text-xs text-[#091540] focus:outline-none focus:ring-1 focus:ring-[#1B2CC1]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl px-3 py-2 text-xs text-[#091540] focus:outline-none focus:ring-1 focus:ring-[#1B2CC1]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl px-3 py-2 text-xs text-[#091540] focus:outline-none focus:ring-1 focus:ring-[#1B2CC1]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Worker Availability</label>
                  <select
                    value={editWorkerStatus}
                    onChange={(e: any) => setEditWorkerStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2CC1] rounded-xl px-3 py-2 text-xs text-[#091540] focus:outline-none"
                  >
                    <option value="AVAILABLE">&#9679; AVAILABLE (Ready for Assignment)</option>
                    <option value="BUSY">&#9679; BUSY (Active on Job Site)</option>
                    <option value="OFF_DUTY">&#9679; OFF DUTY (Leave / Unavailable)</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEdit}
                    className="px-4 py-2 rounded-xl bg-[#1B2CC1] hover:bg-[#15239E] text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    {isSubmittingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
