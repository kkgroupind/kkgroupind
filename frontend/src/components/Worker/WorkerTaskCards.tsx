'use client';

import React from 'react';
import {
  Bike,
  Footprints,
  Activity,
  MoreVertical,
  CheckCircle2,
  PlayCircle,
  HardHat,
  Clock,
} from 'lucide-react';
import { ServiceEnquiry } from '@/services';

interface TaskItem {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  progressText: string;
  badgeText: string;
  iconType: 'bike' | 'runner' | 'shoe' | 'hardhat';
  job?: ServiceEnquiry;
}

interface WorkerTaskCardsProps {
  jobs?: ServiceEnquiry[];
  onSelectJob?: (job: ServiceEnquiry) => void;
}

export function WorkerTaskCards({
  jobs = [],
  onSelectJob,
}: WorkerTaskCardsProps) {
  const displayTasks: TaskItem[] =
    jobs.length > 0
      ? jobs.slice(0, 6).map((job, idx) => {
          const isInProgress = job.status === 'IN_PROGRESS';
          const isCompleted = job.status === 'COMPLETED';

          const progress = isCompleted ? 100 : isInProgress ? 65 : 20;
          const badgeText = isCompleted
            ? 'Completed'
            : isInProgress
            ? 'In Progress'
            : 'New Order';

          const iconTypes: Array<'hardhat' | 'runner' | 'bike' | 'shoe'> = [
            'hardhat',
            'runner',
            'bike',
          ];

          return {
            id: job.id,
            title: job.serviceName,
            subtitle: job.customerName
              ? `Client: ${job.customerName}`
              : job.location || 'Kerala Site',
            progress,
            progressText: job.trackingNumber,
            badgeText,
            iconType: iconTypes[idx % iconTypes.length],
            job,
          };
        })
      : [
          {
            id: 'standby-orders',
            title: 'No Assigned Work Orders',
            subtitle: 'Waiting for office dispatch allocation',
            progress: 0,
            progressText: 'Queue: 0 Orders',
            badgeText: 'Standby',
            iconType: 'hardhat',
          },
          {
            id: 'standby-duty',
            title: 'Field Duty Attendance',
            subtitle: 'Kerala regional workforce network',
            progress: 100,
            progressText: 'Duty Active',
            badgeText: 'Live',
            iconType: 'runner',
          },
          {
            id: 'standby-comms',
            title: 'Operations Desk Link',
            subtitle: 'Connected to office coordinators',
            progress: 100,
            progressText: 'Online Link',
            badgeText: 'Ready',
            iconType: 'bike',
          },
        ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-5 w-full select-none">
      {displayTasks.map((task) => {
        const iconComponent = {
          bike: <Bike className="w-5 h-5 text-white" />,
          runner: <Activity className="w-5 h-5 text-white" />,
          shoe: <Footprints className="w-5 h-5 text-white" />,
          hardhat: <HardHat className="w-5 h-5 text-white" />,
        }[task.iconType];

        return (
          <div
            key={task.id}
            onClick={() => task.job && onSelectJob?.(task.job)}
            className="bg-white rounded-[28px] sm:rounded-[32px] p-5 pt-8 shadow-[0_12px_35px_rgba(94,66,180,0.07)] border border-slate-100 flex flex-col justify-between relative hover:shadow-[0_20px_45px_rgba(94,66,180,0.14)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
          >
            {/* 1. Centered Floating Squircle Icon on Top */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#5E42B4] shadow-[0_8px_20px_rgba(94,66,180,0.35)] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              {iconComponent}
            </div>

            {/* 2. Top Right 3 Dots Menu */}
            <div className="flex justify-end w-full mb-1">
              <button
                type="button"
                aria-label="More options"
                className="text-slate-300 hover:text-slate-600 transition-colors p-1 rounded-lg"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* 3. Title & Subtitle */}
            <div className="text-center px-1 mb-4">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight leading-snug line-clamp-1">
                {task.title}
              </h4>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5 line-clamp-1">
                {task.subtitle}
              </p>
            </div>

            {/* 4. Progress Section with Green Indicator */}
            <div className="w-full space-y-1.5 mb-4">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-400">Progress</span>
                <span className="text-slate-700">{task.progress}%</span>
              </div>
              {/* Progress Bar Track */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>

            {/* 5. Bottom Row: Fraction / Code + Soft Pink Badge */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[11px]">
              <span className="font-bold text-slate-400 tracking-tight truncate max-w-[120px]">
                {task.progressText}
              </span>
              <span className="font-bold text-[#E53E6D] bg-[#FCE6EC] px-3 py-1 rounded-full whitespace-nowrap">
                {task.badgeText}
              </span>
            </div>

            {/* 6. Quick Mobile Field Trigger Bar */}
            {task.job && (
              <div
                className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {task.job.customerPhone ? (
                  <a
                    href={`tel:${task.job.customerPhone}`}
                    aria-label={`Call customer ${task.job.customerName}`}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>📞 Call Client</span>
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400 font-semibold italic">
                    Location: Kerala
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onSelectJob?.(task.job!)}
                  className="py-1.5 px-3 rounded-xl bg-[#5E42B4]/10 hover:bg-[#5E42B4] text-[#5E42B4] hover:text-white text-[11px] font-bold transition-all cursor-pointer"
                >
                  Manage
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
