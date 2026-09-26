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
  Users,
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
  AtSign,
  ArrowLeft,
  Filter,
  Briefcase,
  Shield,
  MessageCircle,
  Menu,
} from 'lucide-react';
import { OfficeStaffSidebar } from '@/components/OfficeStaff';

export default function OfficeStaffPeoplePage() {
  const { token, user: authUser, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  // State
  const [people, setPeople] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'WORKER' | 'CUSTOMER'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<User | null>(null);

  // Create Form State
  const [createName, setCreateName] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<'WORKER' | 'CUSTOMER'>('CUSTOMER');
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

  // 1. Auth check & URL param sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      if (roleParam === 'WORKER' || roleParam === 'CUSTOMER') {
        setRoleFilter(roleParam);
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!token || (authUser?.role !== 'OFFICE_STAFF' && authUser?.role !== 'SUPER_ADMIN')) {
        router.push('/office-staff/login');
        return;
      }
      loadPeople();
    }
  }, [authLoading, token, authUser, router]);

  // 2. Fetch people list
  const loadPeople = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await officeStaffPeopleService.listPeople(token, {
        limit: 100,
      });
      setPeople(res.data || []);
    } catch (err: any) {
      console.error('Failed to load people:', err);
      setErrorMessage(err?.message || 'Failed to load people directory');
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
      } catch (e) {
        setCreateUsernameStatus('idle');
      }
    }, 450);

    return () => {
      if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current);
    };
  }, [createUsername, token]);

  // 4. Handle Create Person
  const handleCreatePerson = async (e: React.FormEvent) => {
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
        role: createRole,
        email: createEmail.trim() || undefined,
      };

      const res = await officeStaffPeopleService.createPerson(payload, token);
      showToast(`${createRole === 'WORKER' ? 'Field Worker' : 'Customer'} created successfully!`);
      setIsCreateModalOpen(false);
      // Reset form
      setCreateName('');
      setCreateUsername('');
      setCreatePhone('');
      setCreateEmail('');
      setCreatePassword('');
      loadPeople();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create person record');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // 5. Open Edit Modal
  const openEditModal = (person: User) => {
    setSelectedPerson(person);
    setEditName(person.name || '');
    setEditPhone(person.phone || '');
    setEditEmail(person.email || '');
    setEditWorkerStatus(person.workerStatus || 'AVAILABLE');
    setIsEditModalOpen(true);
  };

  // 6. Handle Edit Save
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedPerson) return;

    setIsSubmittingEdit(true);
    try {
      const payload: OfficeStaffUpdatePersonData = {
        name: editName.trim(),
        mobileNumber: editPhone.trim() || undefined,
        email: editEmail.trim() || undefined,
        workerStatus: selectedPerson.role === 'WORKER' ? editWorkerStatus : undefined,
      };

      await officeStaffPeopleService.updatePerson(selectedPerson.id, payload, token);
      showToast('Person details updated successfully!');
      setIsEditModalOpen(false);
      loadPeople();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update person record');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Filtered List
  const filteredPeople = people.filter((p) => {
    if (roleFilter !== 'ALL' && p.role !== roleFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(term);
      const matchUsername = p.username?.toLowerCase().includes(term);
      const matchPhone = p.phone?.toLowerCase().includes(term);
      const matchEmail = p.email?.toLowerCase().includes(term);
      return matchName || matchUsername || matchPhone || matchEmail;
    }
    return true;
  });

  const workerCount = people.filter((p) => p.role === 'WORKER').length;
  const customerCount = people.filter((p) => p.role === 'CUSTOMER').length;
  const availableWorkersCount = people.filter(
    (p) => p.role === 'WORKER' && p.workerStatus === 'AVAILABLE',
  ).length;

  return (
    <div className="min-h-screen bg-[#0D0E12] text-gray-100 flex">
      {/* Navigation Sidebar */}
      <OfficeStaffSidebar
        activeSection={roleFilter === 'WORKER' ? 'people-workers' : 'people-customers'}
        onSelectSection={(sec) => {
          if (sec === 'people-customers') {
            setRoleFilter('CUSTOMER');
            return;
          }
          if (sec === 'people-workers') {
            setRoleFilter('WORKER');
            return;
          }
          if (sec === 'profile') {
            router.push('/office-staff/profile');
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
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 bg-[#0D0E12]">
        {/* Top Header */}
        <header className="border-b border-gray-800/80 bg-[#0E1017]/90 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
            >
              <Menu className="w-4 h-4" />
            </button>
            <Link
              href="/office-staff/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all text-xs font-semibold border border-gray-700/60"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Desk</span>
            </Link>
            <div className="h-4 w-px bg-gray-800 hidden sm:block" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                People Management Directory
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#EBF6F1]/10 text-[#2A835F] border border-[#2A835F]/30">
                OFFICE STAFF
              </span>
            </div>
            <span className="text-[11px] text-gray-400 hidden sm:inline">
              വർക്കേഴ്സ് & കസ്റ്റമേഴ്സ് • Kerala Field Operations
            </span>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={() => {
            setCreateRole('CUSTOMER');
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#2A835F] hover:bg-[#236b4e] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Person</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Summary Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#12141C]/90 rounded-2xl border border-gray-800/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400">Total Customers</span>
              <div className="text-xl font-black text-white mt-0.5">{customerCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <UserCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#12141C]/90 rounded-2xl border border-gray-800/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400">Total Field Workers</span>
              <div className="text-xl font-black text-white mt-0.5">{workerCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <HardHat className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#12141C]/90 rounded-2xl border border-gray-800/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400">Available for Dispatch</span>
              <div className="text-xl font-black text-emerald-400 mt-0.5">
                {availableWorkersCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-[#12141C]/90 rounded-2xl border border-gray-800/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0E1017] rounded-xl border border-gray-800 text-xs font-semibold w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex-1 sm:flex-initial ${
                roleFilter === 'ALL'
                  ? 'bg-gray-800 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All People ({people.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('WORKER')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex-1 sm:flex-initial ${
                roleFilter === 'WORKER'
                  ? 'bg-gray-800 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Field Workers ({workerCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('CUSTOMER')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex-1 sm:flex-initial ${
                roleFilter === 'CUSTOMER'
                  ? 'bg-gray-800 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Customers ({customerCount})
            </button>
          </div>

          {/* Search Box & Refresh */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, phone, user..."
                className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#2A835F]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={loadPeople}
              title="Refresh Directory"
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700/60"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#2A835F]' : ''}`} />
            </button>
          </div>
        </div>

        {/* People Table */}
        <div className="bg-[#12141C]/90 rounded-2xl border border-gray-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0E1017] text-gray-400 font-semibold border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Name & Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assignments</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/70">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#2A835F] mb-2" />
                      Loading People records...
                    </td>
                  </tr>
                ) : filteredPeople.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filteredPeople.map((person) => {
                    const isWorker = person.role === 'WORKER';
                    const assignmentCount =
                      (person as any)?._count?.workerAssignments ||
                      (person as any)?._count?.customerEnquiries ||
                      0;

                    return (
                      <tr key={person.id} className="hover:bg-[#161922] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-xs text-gray-200">
                              {(person.name || person.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white">
                                {person.name || 'Unnamed'}
                              </span>
                              <span className="font-mono text-[11px] text-gray-500">
                                @{person.username}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              isWorker
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}
                          >
                            {isWorker ? (
                              <HardHat className="w-3 h-3" />
                            ) : (
                              <UserCircle className="w-3 h-3" />
                            )}
                            <span>{isWorker ? 'Field Worker' : 'Customer'}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5">
                            {person.phone ? (
                              <div className="flex items-center gap-1.5 text-gray-300">
                                <Phone className="w-3 h-3 text-gray-500" />
                                <span>{person.phone}</span>
                              </div>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                            {person.email && (
                              <span className="text-[11px] text-gray-500 truncate max-w-[160px]">
                                {person.email}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {isWorker ? (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                                person.workerStatus === 'AVAILABLE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : person.workerStatus === 'BUSY'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  person.workerStatus === 'AVAILABLE'
                                    ? 'bg-emerald-400'
                                    : person.workerStatus === 'BUSY'
                                    ? 'bg-amber-400'
                                    : 'bg-gray-500'
                                }`}
                              />
                              {person.workerStatus || 'AVAILABLE'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Active Client
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-medium text-gray-300">
                          {assignmentCount}{' '}
                          <span className="text-gray-500 text-[10px]">
                            {isWorker ? 'jobs' : 'enquiries'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {person.phone && (
                              <a
                                href={`https://wa.me/${person.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                title="WhatsApp"
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => openEditModal(person)}
                              title="Edit Record"
                              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
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

      {/* CREATE PERSON MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12141C] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <h3 className="text-sm font-bold text-white">Register New Person</h3>
                <p className="text-[11px] text-gray-400">
                  Onboard a new field worker or customer client record.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePerson} className="space-y-3.5 mt-4">
              {/* Role Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Designated Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateRole('CUSTOMER')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      createRole === 'CUSTOMER'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-[#0E1017] border-gray-800 text-gray-400'
                    }`}
                  >
                    <UserCircle className="w-3.5 h-3.5" />
                    <span>Customer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateRole('WORKER')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      createRole === 'WORKER'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#0E1017] border-gray-800 text-gray-400'
                    }`}
                  >
                    <HardHat className="w-3.5 h-3.5" />
                    <span>Field Worker</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Full Name *</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Radhakrishnan V."
                  required
                  className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none"
                />
              </div>

              {/* Username with live check */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-gray-300">Username *</label>
                  {createUsernameStatus === 'checking' && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" /> Checking...
                    </span>
                  )}
                  {createUsernameStatus === 'available' && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Available
                    </span>
                  )}
                  {createUsernameStatus === 'taken' && (
                    <span className="text-[10px] text-rose-400 flex items-center gap-1">
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
                  className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none"
                />
                {createUsernameSuggestions.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-gray-400 pt-1">
                    <span>Suggestions:</span>
                    {createUsernameSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setCreateUsername(sug)}
                        className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 hover:text-white"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Mobile Phone *</label>
                <input
                  type="tel"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  placeholder="+91 98460 00000"
                  required
                  className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none"
                />
              </div>

              {/* Email (Optional or required for customer) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">
                  Email Address {createRole === 'CUSTOMER' ? '*' : '(Optional)'}
                </label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="client@gmail.com"
                  required={createRole === 'CUSTOMER'}
                  className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none"
                />
              </div>

              {/* Temporary Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Password *</label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  required
                  className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate || createUsernameStatus === 'taken'}
                  className="px-4 py-2 rounded-xl bg-[#2A835F] hover:bg-[#236b4e] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  {isSubmittingCreate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PERSON MODAL */}
      {isEditModalOpen && selectedPerson && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12141C] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <h3 className="text-sm font-bold text-white">Edit Person Details</h3>
                <p className="text-[11px] text-gray-400">
                  Update info for @{selectedPerson.username} ({selectedPerson.role})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 mt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#0E1017] border border-gray-800 focus:border-[#2A835F] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {selectedPerson.role === 'WORKER' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Worker Availability</label>
                  <select
                    value={editWorkerStatus}
                    onChange={(e: any) => setEditWorkerStatus(e.target.value)}
                    className="w-full bg-[#0E1017] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="AVAILABLE">AVAILABLE (Ready for Assignment)</option>
                    <option value="BUSY">BUSY (Active on Job Site)</option>
                    <option value="OFF_DUTY">OFF DUTY (Leave / Unavailable)</option>
                  </select>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 rounded-xl bg-[#2A835F] hover:bg-[#236b4e] text-white text-xs font-bold flex items-center gap-1.5"
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
