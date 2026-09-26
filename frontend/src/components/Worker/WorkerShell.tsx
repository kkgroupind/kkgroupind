'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useWorker } from '@/context/worker-context';
import {
  WorkerNavbar,
  WorkerHeader,
  WorkerCrewList,
  WorkerLiveMap,
  WorkerJobDetailsModal,
  WorkerAvailabilityModal,
  CrewMember,
} from '@/components/Worker';

interface WorkerShellProps {
  children: React.ReactNode;
  activeTab?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  hideSidebar?: boolean;
}

export function WorkerShell({
  children,
  activeTab,
  searchQuery = '',
  onSearchChange,
  hideSidebar = false,
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
  } = useWorker();

  const handleLogout = () => {
    logout();
    router.push('/worker/login');
  };

  const handleMessageCrew = (member: CrewMember) => {
    if (member.phone) {
      window.location.href = `tel:${member.phone}`;
    } else {
      toast.info(
        `Field Operative: ${member.name}`,
        `${member.name} is currently ${member.isOnline ? 'Active' : 'Standby'} • ${member.role}.`
      );
    }
  };

  const handleViewMap = () => {
    toast.info(
      'Kerala Live Ops Map',
      'Displaying real-time Kerala field coordinates & active squad positioning.'
    );
  };

  return (
    <div className="min-h-screen bg-[#E5E8F2] pt-24 sm:pt-28 px-2 sm:px-4 md:px-6 lg:px-8 pb-28 md:pb-12 flex flex-col items-center gap-4 sm:gap-6 font-sans antialiased text-slate-800 selection:bg-[#5E42B4] selection:text-white">
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

      {/* 2. BODY CONTAINER: MAIN CONTENT + STICKY RIGHT SIDEBAR */}
      <div className="w-full max-w-[1480px] flex items-start gap-5 lg:gap-6 relative">
        {/* Main Content Card */}
        <main className="flex-1 min-w-0 bg-[#ECEFF6] rounded-[32px] sm:rounded-[44px] p-4 sm:p-6 lg:p-7 shadow-[0_20px_70px_rgba(0,0,0,0.08)] border border-white/70 flex flex-col gap-5 lg:gap-6 min-h-[820px]">
          {/* Header with Title, Search, User Avatar */}
          <WorkerHeader
            userName={user?.name || user?.username || 'Operative'}
            userAvatar={user?.avatar || undefined}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onProfileClick={() => router.push('/worker/profile')}
          />

          {/* Page Content */}
          <div className="w-full flex-1 flex flex-col gap-6">
            {children}
          </div>
        </main>

        {/* Right Sidebar Panel: Field Squad & Live Map (Visible on Desktop across all pages) */}
        {!hideSidebar && (
          <aside
            aria-label="Field Squad & Live Map"
            className="hidden lg:flex w-72 xl:w-80 shrink-0 sticky top-28 bg-white rounded-[32px] sm:rounded-[36px] p-5 sm:p-6 shadow-[0_20px_60px_rgba(94,66,180,0.08)] border border-white/90 flex-col justify-between gap-4 transition-all z-30 max-h-[calc(100vh-8.5rem)] overflow-hidden"
          >
            {/* Top: Friends / Teammates */}
            <WorkerCrewList members={crewMembers} onMessageCrew={handleMessageCrew} />

            {/* Bottom: Live Map Preview */}
            <WorkerLiveMap
              locationTitle={activeJob?.location || 'Kerala Operations Sector'}
              operatives={crewMembers}
              onViewMap={handleViewMap}
            />
          </aside>
        )}
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
    </div>
  );
}
