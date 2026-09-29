'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useWorker } from '@/context/worker-context';
import {
  WorkerNavbar,
  WorkerHeader,
  WorkerJobDetailsModal,
  WorkerAvailabilityModal,
  WorkerFullMapModal,
  WorkerMapSettingsModal,
} from '@/components/Worker';

interface WorkerShellProps {
  children: React.ReactNode;
  activeTab?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  hideSidebar?: boolean;
  hideHeader?: boolean;
}

export function WorkerShell({
  children,
  activeTab,
  searchQuery = '',
  onSearchChange,
  hideSidebar = true,
  hideHeader = false,
}: WorkerShellProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const toast = useToast();
  const {
    jobs,
    crewMembers,
    isOnDuty,
    togglingDuty,
    requestToggleDuty,
    confirmDutyChange,
    updateJobStatus,
    actionLoadingId,
    selectedJob,
    isJobModalOpen,
    closeJobModal,
    isAvailabilityModalOpen,
    setIsAvailabilityModalOpen,
    activeJob,
    assignedJobsCount,
    hasNotifications,
    isReloading,
    reloadAll,
  } = useWorker();

  const handleLogout = () => {
    logout();
    router.push('/worker/login');
  };

  const handleViewMap = () => {
    toast.info(
      'Kerala Live Ops Map',
      'Displaying real-time Kerala field coordinates & active assignment.'
    );
  };

  return (
    <div className="min-h-screen bg-[#EAEFEA] pt-18 sm:pt-28 px-2 sm:px-4 md:px-6 pb-24 md:pb-12 flex flex-col items-center gap-3 sm:gap-6 font-sans antialiased text-slate-800 selection:bg-[#2A835F] selection:text-white w-full overflow-x-hidden">
      {/* 1. TOP NAVBAR */}
      <WorkerNavbar
        activeTab={activeTab}
        onLogout={handleLogout}
        hasNotifications={hasNotifications}
        assignedJobsCount={assignedJobsCount}
        isOnDuty={isOnDuty}
        onToggleDuty={requestToggleDuty}
        isTogglingDuty={togglingDuty}
        userName={user?.name || user?.username || 'Operative'}
        userAvatar={user?.avatar}
        userHandle={user?.username || undefined}
        userRole={user?.role}
      />

      {/* 2. BODY CONTAINER: MOBILE-FIRST FOCUSED WORKSPACE */}
      <div className="w-full max-w-5xl mx-auto flex items-start gap-4 relative justify-center min-w-0">
        {/* Main Content Card */}
        <main className="w-full min-w-0 bg-[#ECEFF6] rounded-2xl sm:rounded-[38px] p-2 sm:p-5 lg:p-6 shadow-[0_15px_50px_rgba(0,0,0,0.06)] border border-white/70 flex flex-col gap-3.5 sm:gap-5 min-h-[auto]">
          {/* Header with Title, Search, User Avatar (optional) */}
          {!hideHeader && (
            <WorkerHeader
              userName={user?.name || user?.username || 'Operative'}
              userAvatar={user?.avatar || undefined}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onProfileClick={() => router.push('/worker/profile')}
              onReload={reloadAll}
              isReloading={isReloading}
            />
          )}

          {/* Page Content */}
          <div className="w-full flex-1 flex flex-col gap-4 sm:gap-5">
            {children}
          </div>
        </main>
      </div>

      {/* 3. MODALS */}
      <WorkerJobDetailsModal
        job={selectedJob}
        isOpen={isJobModalOpen}
        onClose={closeJobModal}
        onUpdateStatus={updateJobStatus}
        isActing={actionLoadingId === selectedJob?.id}
      />

      <WorkerAvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        onConfirm={confirmDutyChange}
        isLoading={togglingDuty}
        userName={user?.name || user?.username || 'Field Worker'}
        currentStatus={isOnDuty ? 'AVAILABLE' : 'OFF_DUTY'}
      />

      {/* React Leaflet Map Modals - Dedicated to current operative & job site */}
      <WorkerFullMapModal
        activeJob={activeJob}
        jobs={jobs}
        operatives={[]}
      />
      <WorkerMapSettingsModal />
    </div>
  );
}
