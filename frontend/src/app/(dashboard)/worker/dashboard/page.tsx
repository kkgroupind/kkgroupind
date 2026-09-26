'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import {
  WorkerNavbar,
  WorkerHeader,
  WorkerOverviewChart,
  WorkerDutyCards,
  WorkerTaskCards,
  WorkerCrewList,
  WorkerLiveMap,
  WorkerJobDetailsModal,
  WorkerAvailabilityModal,
  CrewMember,
} from '@/components/Worker';
import {
  AttendanceService,
  EnquiryService,
  ServiceEnquiry,
  WorkerStatus,
} from '@/services';

export default function WorkerDashboardPage() {
  const router = useRouter();
  const { user, token, isLoading, logout } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [togglingDuty, setTogglingDuty] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [jobs, setJobs] = useState<ServiceEnquiry[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [selectedJob, setSelectedJob] = useState<ServiceEnquiry | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Authentication & Role verification
  useEffect(() => {
    if (!isLoading) {
      if (!token || !user) {
        router.push('/worker/login');
      } else if (user.role !== 'WORKER') {
        router.push('/');
      }
    }
  }, [isLoading, token, user, router]);

  // Load worker availability and attendance
  const loadAttendance = useCallback(async () => {
    if (!token) return;
    try {
      const res = await AttendanceService.getTodayAttendance(token);
      setIsOnDuty(res.isAvailable);
    } catch (err) {
      console.error('Failed to fetch worker attendance:', err);
    }
  }, [token]);

  // Fetch worker assigned jobs from backend
  const loadJobs = useCallback(async () => {
    if (!token) return;
    setLoadingJobs(true);
    try {
      const res = await EnquiryService.getWorkerJobs(token);
      setJobs(res.jobs || []);
    } catch (err: any) {
      console.error('Failed to fetch worker jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  }, [token]);

  // Fetch active squad members from backend
  const loadCrew = useCallback(async () => {
    if (!token) return;
    try {
      const res = await EnquiryService.getActiveWorkers(token);
      const list: CrewMember[] = (res.workers || [])
        .filter((w) => w.id !== user?.id)
        .map((w) => ({
          id: w.id,
          name: w.name || w.username || 'Field Operative',
          role: `${
            w.workerStatus === 'BUSY'
              ? 'Active On Field'
              : w.workerStatus === 'AVAILABLE'
              ? 'Available &bull; Standby'
              : 'Off Duty'
          } &bull; Kerala Hub`,
          activity:
            w.workerStatus === 'BUSY'
              ? 'Active Job'
              : w.workerStatus === 'AVAILABLE'
              ? 'Available'
              : 'Off Duty',
          avatar: w.avatar || undefined,
          isOnline: w.workerStatus === 'AVAILABLE' || w.workerStatus === 'BUSY',
          phone: w.phone || undefined,
        }));
      setCrewMembers(list);
    } catch (err) {
      console.error('Failed to load active crew:', err);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (token) {
      loadJobs();
      loadAttendance();
      loadCrew();
    }
  }, [loadJobs, loadAttendance, loadCrew, token]);

  // Open confirmation modal on toggle request
  const handleRequestToggleDuty = () => {
    setIsAvailabilityModalOpen(true);
  };

  // Confirmed toggle duty status via modal
  const handleConfirmDutyChange = async (targetStatus: 'AVAILABLE' | 'OFF_DUTY') => {
    if (!token || togglingDuty) return;
    setTogglingDuty(true);
    try {
      await AttendanceService.updateStatus(targetStatus, token);
      const isAvailable = targetStatus === 'AVAILABLE';
      setIsOnDuty(isAvailable);
      setIsAvailabilityModalOpen(false);
      if (isAvailable) {
        toast.success(
          'ഡ്യൂട്ടി ലഭ്യമാണ് / Available for Work',
          'You are now marked Available for new field dispatches.'
        );
      } else {
        toast.info(
          'അവധിയാണ് / On Leave / Off Duty',
          'You are now marked Off Duty. No new dispatches will be assigned to you.'
        );
      }
    } catch (err: any) {
      toast.error('Duty Update Failed', err?.message || 'Could not update status');
    } finally {
      setTogglingDuty(false);
    }
  };

  // Update work order status (IN_PROGRESS or COMPLETED)
  const handleUpdateStatus = async (
    jobId: string,
    newStatus: 'IN_PROGRESS' | 'COMPLETED'
  ) => {
    if (!token) return;
    setActionLoadingId(jobId);
    try {
      await EnquiryService.updateWorkerJobStatus(
        jobId,
        newStatus,
        newStatus === 'COMPLETED'
          ? 'Work completed and inspected by field operative'
          : undefined,
        token
      );

      if (newStatus === 'IN_PROGRESS') {
        toast.success(
          'Work Order Started',
          'Status changed to IN PROGRESS. Office dispatch coordinator notified.'
        );
      } else {
        toast.success(
          'Work Order Completed',
          'Great job! Task marked as COMPLETED and logged in payroll ledger.'
        );
      }

      await loadJobs();
      if (selectedJob?.id === jobId) {
        setSelectedJob((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      setIsJobModalOpen(false);
    } catch (err: any) {
      toast.error('Status Update Failed', err?.message || 'Unable to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenJobModal = (job: ServiceEnquiry) => {
    setSelectedJob(job);
    setIsJobModalOpen(true);
  };

  const handleMessageCrew = (member: CrewMember) => {
    if (member.phone) {
      window.location.href = `tel:${member.phone}`;
    } else {
      toast.info(
        `Field Teammate: ${member.name}`,
        `${member.name} is currently ${member.isOnline ? 'Online' : 'Offline'} on ${member.role}.`
      );
    }
  };

  const handleViewMap = () => {
    toast.info(
      'Live Operations Map',
      'Real-time Kerala site coordinates and active squad positioning loaded.'
    );
  };

  const handleLogout = () => {
    logout();
    router.push('/worker/login');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#ECEFF6] flex items-center justify-center p-8">
        <div className="w-9 h-9 rounded-full border-3 border-[#5E42B4] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Active job for pink card
  const activeJob = jobs.find((j) => j.status === 'IN_PROGRESS') || jobs[0];
  const activeJobTitle = activeJob ? activeJob.serviceName : 'Standby / No Active Dispatch';

  // Real job statistics for the current logged-in worker
  const completedJobsCount = jobs.filter((j) => j.status === 'COMPLETED').length;
  const activeJobsCount = jobs.filter((j) => j.status === 'IN_PROGRESS').length;
  const totalJobsCount = jobs.length;

  const currentMonthShort = new Date().toLocaleString('en-US', { month: 'short' });
  const currentMonthLong = new Date().toLocaleString('en-US', { month: 'long' });

  return (
    <div className="min-h-screen bg-[#E5E8F2] pt-24 sm:pt-28 px-2 sm:px-4 md:px-6 lg:px-8 pb-28 md:pb-10 flex flex-col items-center gap-4 sm:gap-6 font-sans antialiased text-slate-800 selection:bg-[#5E42B4] selection:text-white">
      {/* ========================================================
          1. TOP: PERMANENTLY FIXED NAVBAR (Zero Movement on Scroll)
      ======================================================== */}
      <WorkerNavbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'tasks') {
            toast.info('Work Orders', `${jobs.length} total work orders assigned.`);
          } else if (tab === 'crew') {
            toast.info('Field Squad', 'Active crew operatives and live GPS radar.');
          }
        }}
        onLogout={handleLogout}
        hasNotifications={jobs.some((j) => j.status === 'ASSIGNED')}
        assignedJobsCount={jobs.filter((j) => j.status === 'ASSIGNED').length}
        isOnDuty={isOnDuty}
        onToggleDuty={handleRequestToggleDuty}
        isTogglingDuty={togglingDuty}
        userName={user.name || user.username || 'Operative'}
        userAvatar={user.avatar}
        userHandle={user.username || undefined}
        userRole={user.role}
      />

      {/* ========================================================
          2. DASHBOARD BODY CONTAINER (Left Card & Right Card Separated)
      ======================================================== */}
      <div className="w-full max-w-[1480px] flex items-start gap-5 lg:gap-6 relative">
        {/* ====================================================
            LEFT MAIN DASHBOARD WINDOW (Separate Standalone Card)
            Only this scrolls smoothly when exploring jobs & charts!
        ==================================================== */}
        <main className="flex-1 min-w-0 bg-[#ECEFF6] rounded-[32px] sm:rounded-[44px] p-4 sm:p-6 lg:p-7 shadow-[0_20px_70px_rgba(0,0,0,0.08)] border border-white/70 flex flex-col justify-between gap-5 lg:gap-6 min-h-[850px] lg:mr-76 xl:mr-84">
          {/* Header with Primary Dashboard Title, Search, User Avatar */}
          <WorkerHeader
            userName={user.name || user.username || 'Operative'}
            userAvatar={user.avatar || undefined}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onProfileClick={() => router.push('/worker/profile')}
          />

          {/* UTMOST MOBILE-FRIENDLY QUICK VIEW SWITCHER (Phones < lg) */}
          <div className="lg:hidden flex items-center bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 shadow-xs gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#5E42B4] text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-[#5E42B4] text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📋 Orders</span>
              {jobs.length > 0 && (
                <span className="bg-[#FF5E88] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {jobs.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('crew')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                activeTab === 'crew'
                  ? 'bg-[#5E42B4] text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👥 Squad & Map
            </button>
          </div>

          {/* Mobile View Condition 1: Squad & Map displayed when selected on mobile */}
          {activeTab === 'crew' && (
            <div className="lg:hidden w-full bg-white rounded-[28px] p-5 shadow-[0_12px_35px_rgba(94,66,180,0.06)] border border-slate-100/90 flex flex-col gap-5">
              <WorkerCrewList members={crewMembers} onMessageCrew={handleMessageCrew} />
              <WorkerLiveMap
                locationTitle={activeJob?.location || 'Kerala Operations Sector'}
                operatives={crewMembers}
                onViewMap={handleViewMap}
              />
            </div>
          )}

          {/* Middle Row: Overview Chart Card + 2 Stacked Right Duty Cards */}
          {(activeTab === 'home' || activeTab === 'analytics' || typeof window === 'undefined') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Left Big Card: Overview Wavy Chart */}
              <div className="lg:col-span-7 xl:col-span-8 flex">
                <WorkerOverviewChart
                  totalHours={`${activeJobsCount} Active`}
                  totalCompleted={`${completedJobsCount} Orders`}
                  target={`${Math.max(10, totalJobsCount + 2)} Target`}
                  currentMonth={currentMonthShort}
                  monthName={currentMonthLong}
                />
              </div>

              {/* Right Stacked Cards: Daily Field Duty + Active Dispatch */}
              <div className="lg:col-span-5 xl:col-span-4 flex">
                <WorkerDutyCards
                  isOnDuty={isOnDuty}
                  onToggleDuty={handleRequestToggleDuty}
                  isTogglingDuty={togglingDuty}
                  activeJobTitle={activeJobTitle}
                  totalTimeWorked={`${completedJobsCount} Done`}
                  currentMonth={currentMonthLong}
                  onViewActiveJob={() => {
                    if (activeJob) {
                      handleOpenJobModal(activeJob);
                    } else {
                      toast.info(
                        'No Active Work Order',
                        'You currently have no active work order in progress.'
                      );
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Bottom Row: 3 Task / Drill Cards */}
          {(activeTab === 'home' || activeTab === 'tasks') && (
            <div className="w-full">
              <WorkerTaskCards
                jobs={jobs}
                onSelectJob={handleOpenJobModal}
              />
            </div>
          )}
        </main>

        {/* ====================================================
            3. RIGHT SIDEBAR PANEL (Separate Standalone Card)
            Desktop: PERMANENTLY FIXED right below the navbar, NO move while left card scrolls!
            Map is FIXED in full view at bottom, Squad scrolls invisibly with zero scrollbar
        ==================================================== */}
        <aside
          aria-label="Field Squad & Live Map"
          style={{
            right: 'max(1rem, calc((100vw - 1480px) / 2 + 1rem))',
          }}
          className="hidden lg:flex w-72 xl:w-80 fixed top-24 sm:top-28 bg-white rounded-[32px] sm:rounded-[36px] p-5 sm:p-6 shadow-[0_20px_60px_rgba(94,66,180,0.08)] border border-white/90 flex-col justify-between shrink-0 gap-4 transition-all z-30 max-h-[calc(100vh-8.5rem)] overflow-hidden"
        >
          {/* Top: Friends / Teammates (Clean view, invisible scroll) */}
          <WorkerCrewList members={crewMembers} onMessageCrew={handleMessageCrew} />

          {/* Bottom: Live Map Preview (Fixed inside the sidebar in FULL VIEW) */}
          <WorkerLiveMap
            locationTitle={activeJob?.location || 'Kerala Operations Sector'}
            operatives={crewMembers}
            onViewMap={handleViewMap}
          />
        </aside>
      </div>

      {/* ========================================================
          JOB DETAILS & STATUS UPDATE MODAL
      ======================================================== */}
      <WorkerJobDetailsModal
        job={selectedJob}
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        isActing={actionLoadingId === selectedJob?.id}
      />

      {/* ========================================================
          WORKER AVAILABILITY CONFIRMATION MODAL
      ======================================================== */}
      <WorkerAvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        onConfirm={handleConfirmDutyChange}
        isLoading={togglingDuty}
        userName={user?.name || user?.username || 'Field Worker'}
        currentStatus={isOnDuty ? 'AVAILABLE' : 'OFF_DUTY'}
      />
    </div>
  );
}
