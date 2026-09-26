'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { AttendanceService, EnquiryService, ServiceEnquiry } from '@/services';
import { CrewMember } from '@/components/Worker/WorkerCrewList';

interface WorkerContextType {
  jobs: ServiceEnquiry[];
  loadingJobs: boolean;
  refreshJobs: () => Promise<void>;
  crewMembers: CrewMember[];
  loadingCrew: boolean;
  refreshCrew: () => Promise<void>;
  isOnDuty: boolean;
  togglingDuty: boolean;
  requestToggleDuty: () => void;
  confirmDutyChange: (targetStatus: 'AVAILABLE' | 'OFF_DUTY') => Promise<void>;
  updateJobStatus: (jobId: string, newStatus: 'IN_PROGRESS' | 'COMPLETED', notes?: string) => Promise<void>;
  actionLoadingId: string | null;
  selectedJob: ServiceEnquiry | null;
  setSelectedJob: React.Dispatch<React.SetStateAction<ServiceEnquiry | null>>;
  isJobModalOpen: boolean;
  setIsJobModalOpen: (open: boolean) => void;
  openJobModal: (job: ServiceEnquiry) => void;
  closeJobModal: () => void;
  isAvailabilityModalOpen: boolean;
  setIsAvailabilityModalOpen: (open: boolean) => void;
  activeJob: ServiceEnquiry | undefined;
  activeJobsCount: number;
  assignedJobsCount: number;
  completedJobsCount: number;
  hasNotifications: boolean;
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export function WorkerProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const toast = useToast();

  const [jobs, setJobs] = useState<ServiceEnquiry[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loadingCrew, setLoadingCrew] = useState(true);
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [togglingDuty, setTogglingDuty] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ServiceEnquiry | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load attendance/duty status
  const loadAttendance = useCallback(async () => {
    if (!token) return;
    try {
      const res = await AttendanceService.getTodayAttendance(token);
      setIsOnDuty(res.isAvailable);
    } catch (err) {
      console.error('Failed to fetch worker attendance:', err);
    }
  }, [token]);

  // Load worker assigned jobs
  const refreshJobs = useCallback(async () => {
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

  // Load active squad/crew members
  const refreshCrew = useCallback(async () => {
    if (!token) return;
    setLoadingCrew(true);
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
              ? 'Available • Standby'
              : 'Off Duty'
          } • Kerala Hub`,
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
    } finally {
      setLoadingCrew(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (token) {
      loadAttendance();
      refreshJobs();
      refreshCrew();
    }
  }, [token, loadAttendance, refreshJobs, refreshCrew]);

  // Duty Toggle
  const requestToggleDuty = () => {
    setIsAvailabilityModalOpen(true);
  };

  const confirmDutyChange = async (targetStatus: 'AVAILABLE' | 'OFF_DUTY') => {
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

  // Job Status Update (IN_PROGRESS or COMPLETED)
  const updateJobStatus = async (
    jobId: string,
    newStatus: 'IN_PROGRESS' | 'COMPLETED',
    notes?: string
  ) => {
    if (!token) return;
    setActionLoadingId(jobId);
    try {
      await EnquiryService.updateWorkerJobStatus(
        jobId,
        newStatus,
        notes || (newStatus === 'COMPLETED' ? 'Work completed and inspected by field operative' : undefined),
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
          'Task marked as COMPLETED and logged into service ledger.'
        );
      }

      await refreshJobs();
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

  const openJobModal = (job: ServiceEnquiry) => {
    setSelectedJob(job);
    setIsJobModalOpen(true);
  };

  const closeJobModal = () => {
    setIsJobModalOpen(false);
  };

  // Memoized stats
  const activeJob = useMemo(
    () => jobs.find((j) => j.status === 'IN_PROGRESS') || jobs.find((j) => j.status === 'ASSIGNED') || jobs[0],
    [jobs]
  );
  const activeJobsCount = useMemo(() => jobs.filter((j) => j.status === 'IN_PROGRESS').length, [jobs]);
  const assignedJobsCount = useMemo(() => jobs.filter((j) => j.status === 'ASSIGNED').length, [jobs]);
  const completedJobsCount = useMemo(() => jobs.filter((j) => j.status === 'COMPLETED').length, [jobs]);
  const hasNotifications = useMemo(() => assignedJobsCount > 0, [assignedJobsCount]);

  return (
    <WorkerContext.Provider
      value={{
        jobs,
        loadingJobs,
        refreshJobs,
        crewMembers,
        loadingCrew,
        refreshCrew,
        isOnDuty,
        togglingDuty,
        requestToggleDuty,
        confirmDutyChange,
        updateJobStatus,
        actionLoadingId,
        selectedJob,
        setSelectedJob,
        isJobModalOpen,
        setIsJobModalOpen,
        openJobModal,
        closeJobModal,
        isAvailabilityModalOpen,
        setIsAvailabilityModalOpen,
        activeJob,
        activeJobsCount,
        assignedJobsCount,
        completedJobsCount,
        hasNotifications,
      }}
    >
      {children}
    </WorkerContext.Provider>
  );
}

export function useWorker(): WorkerContextType {
  const context = useContext(WorkerContext);
  if (!context) {
    throw new Error('useWorker must be used within a WorkerProvider');
  }
  return context;
}
