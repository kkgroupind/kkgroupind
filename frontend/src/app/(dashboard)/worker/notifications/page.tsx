'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Bell,
  HardHat,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  ChevronRight,
  Filter,
  CheckCheck,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { useWorker } from '@/context/worker-context';
import { useWorkerLanguage } from '@/context/worker-language-context';
import { useAuth } from '@/context/auth-context';
import { WorkerShell } from '@/components/Worker';
import { NotificationFeed } from '@/components/NotificationFeed';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Activity } from 'lucide-react';

export default function WorkerNotificationsPage() {
  const { token } = useAuth();
  const {
    jobs,
    isOnDuty,
    requestToggleDuty,
    openJobModal,
    assignedJobsCount,
    reloadAll,
    isReloading,
  } = useWorker();

  const { language, t, translateService } = useWorkerLanguage();

  const [mainTab, setMainTab] = useState<'notifications' | 'activity'>('notifications');
  const [filterType, setFilterType] = useState<'ALL' | 'NEW' | 'DUTY'>('ALL');

  const assignedJobs = useMemo(() => jobs.filter((j) => j.status === 'ASSIGNED'), [jobs]);
  const inProgressJobs = useMemo(() => jobs.filter((j) => j.status === 'IN_PROGRESS'), [jobs]);
  const completedJobs = useMemo(() => jobs.filter((j) => j.status === 'COMPLETED'), [jobs]);

  return (
    <WorkerShell activeTab="notifications" hideHeader={true}>
      <div className="space-y-3.5 sm:space-y-6 max-w-4xl mx-auto pb-12 w-full min-w-0">
        {/* Main Tab Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={() => setMainTab('notifications')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'notifications'
                ? 'bg-[#134B4C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('notificationsTitle')}</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('activity')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'activity'
                ? 'bg-[#134B4C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">My Activity &amp; Work History (ഓഡിറ്റ് ഹിസ്റ്ററി)</span>
            <span className="sm:hidden">Activity Log</span>
          </button>
        </div>

        {mainTab === 'activity' ? (
          <ActivityFeed
            token={token}
            isDark={false}
            title="My Work Operations &amp; Activity Trail"
            subtitle="Immutable detailed record of your shift check-ins, accepted work orders, meter logs, and completed tasks"
            limit={15}
          />
        ) : (
          <>
            {/* Real-time Persistent Notification Feed */}
            {token && (
              <NotificationFeed
                token={token}
                isDark={false}
                title="Technician Alerts &amp; Dispatches"
              />
            )}

            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white rounded-2xl sm:rounded-[36px] p-3.5 sm:p-6 shadow-[0_12px_35px_rgba(0,0,0,0.04)] border border-slate-100 min-w-0 w-full">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#EAF4EE] text-[#2A835F] border border-[#88B793]/40 flex items-center justify-center font-bold shrink-0">
                  <Briefcase className="w-4 h-4 sm:w-6 sm:h-6 text-[#2A835F]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                      Active Job Queue &amp; Duty Status
                    </h1>
                    <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-[#EAF4EE] text-[#2A835F] border border-[#88B793]/40">
                      {assignedJobsCount} {t('newDispatches')}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 line-clamp-1 sm:line-clamp-none">
                    {t('notificationsSubtitle')}
                  </p>
                </div>
              </div>

              {/* Mobile Filter Dropdown */}
              <div className="flex sm:hidden items-center gap-2 w-full mt-1">
                <div className="relative flex-1">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    aria-label="Filter notifications"
                    className="w-full appearance-none bg-slate-100/90 border border-slate-200/90 text-slate-800 text-xs font-bold py-2.5 pl-3.5 pr-8 rounded-xl focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] cursor-pointer"
                  >
                    <option value="ALL">🔔 {t('allNotifications')}</option>
                    <option value="NEW">📦 {t('newDispatches')} ({assignedJobsCount})</option>
                    <option value="DUTY">👷 {t('shiftStatus')}</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Mobile Reload Button */}
                <button
                  type="button"
                  onClick={() => reloadAll()}
                  disabled={isReloading}
                  title="Reload Live Alerts & Dispatches"
                  aria-label="Reload dispatches"
                  className="p-2.5 rounded-xl bg-slate-100/90 hover:bg-slate-200 border border-slate-200/90 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-[#2A835F] ${isReloading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Desktop Filter Segmented Controls */}
              <div className="hidden sm:flex items-center bg-slate-100/90 p-1.5 rounded-2xl gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setFilterType('ALL')}
                  className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'ALL'
                      ? 'bg-[#134B4C] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('allNotifications')}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('NEW')}
                  className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'NEW'
                      ? 'bg-[#134B4C] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('newDispatches')} ({assignedJobsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('DUTY')}
                  className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'DUTY'
                      ? 'bg-[#134B4C] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('shiftStatus')}
                </button>

                {/* Reload Button */}
                <button
                  type="button"
                  onClick={() => reloadAll()}
                  disabled={isReloading}
                  title="Reload Live Alerts & Dispatches"
                  aria-label="Reload dispatches"
                  className="shrink-0 whitespace-nowrap px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-[#2A835F] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ml-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#2A835F] ${isReloading ? 'animate-spin' : ''}`} />
                  <span>Reload</span>
                </button>
              </div>
            </div>

            {/* Notifications Body */}
            <div className="bg-white rounded-2xl sm:rounded-[36px] p-4 sm:p-7 shadow-[0_12px_35px_rgba(0,0,0,0.04)] border border-slate-100 space-y-3 sm:space-y-3.5">
          {/* Daily Duty Status Card */}
          {(filterType === 'ALL' || filterType === 'DUTY') && (
            <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
                    isOnDuty
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}
                >
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {isOnDuty
                        ? t('dutyAvailable')
                        : t('dutyOff')}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                      {t('shiftStatus')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">
                    {isOnDuty
                      ? (language === 'hi'
                          ? 'आप आज काम के लिए उपलब्ध हैं। कार्यालय समन्वयकर्ता आपके खाते में नए कार्य आदेश आवंटित कर सकते हैं।'
                          : language === 'ml'
                          ? 'നിങ്ങൾ ഇന്ന് ലഭ്യമാണ്. പുതിയ ഓർഡറുകൾ അസൈൻ ചെയ്യാവുന്നതാണ്.'
                          : 'You are marked Available today. Office dispatch coordinators can allocate new customer orders to your queue.')
                      : (language === 'hi'
                          ? 'आपकी ड्यूटी बंद है। दोबारा ड्यूटी सक्रिय करने तक कोई नया कार्य नहीं सौंपा जाएगा।'
                          : language === 'ml'
                          ? 'ഡ്യൂട്ടി അവധിയാണ്. സ്റ്റാറ്റസ് മാറ്റുന്നതുവരെ പുതിയ ഓർഡറുകൾ ലഭിക്കില്ല.'
                          : 'You are marked Off Duty. No new work orders will be assigned until you toggle back on duty.')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={requestToggleDuty}
                className="w-full sm:w-auto text-xs font-bold px-4 py-2.5 sm:py-2 rounded-xl bg-white border border-slate-200 text-[#2A835F] hover:bg-[#EAF4EE] hover:text-[#134B4C] transition-colors shadow-xs shrink-0 cursor-pointer text-center justify-center flex items-center"
              >
                {t('changeShiftStatus')}
              </button>
            </div>
          )}

          {/* New Assigned Work Orders */}
          {(filterType === 'ALL' || filterType === 'NEW') &&
            assignedJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => openJobModal(job)}
                className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#EAF4EE]/60 hover:bg-[#EAF4EE] border border-[#88B793]/40 transition-all cursor-pointer shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 group"
              >
                <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#134B4C] to-[#2A835F] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#2A835F] transition-colors">
                        {t('newOrderDispatched')}: {translateService(job.serviceName)}
                      </span>
                      <span className="font-mono text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#134B4C] text-white">
                        {job.trackingNumber}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {t('actionRequired')}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-1">
                      {t('customer')}: <strong className="text-slate-800">{job.customerName}</strong> • {t('site')}:{' '}
                      <strong className="text-slate-800">{job.location || job.district || 'Kerala'}</strong>
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#88B793]/30">
                  <span className="text-xs font-bold text-[#2A835F] group-hover:underline flex items-center gap-1">
                    <span>{t('inspectDispatch')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}

          {/* In-Progress Work Notifications */}
          {filterType === 'ALL' &&
            inProgressJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => openJobModal(job)}
                className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-amber-50/40 hover:bg-amber-50/80 border border-amber-200/80 transition-all cursor-pointer shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 group"
              >
                <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
                        {t('inProgress')}: {translateService(job.serviceName)}
                      </span>
                      <span className="font-mono text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {job.trackingNumber}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-1">
                      {t('customer')}: {job.customerName} • {t('site')}: {job.location || job.district}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-200/50">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                    <span>{t('inProgress')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}

          {/* Completed Work History Notifications */}
          {filterType === 'ALL' &&
            completedJobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                onClick={() => openJobModal(job)}
                className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/60 hover:bg-slate-100/70 border border-slate-200/60 transition-all cursor-pointer shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 group"
              >
                <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-slate-950 transition-colors">
                        {t('completedBadge')}: {translateService(job.serviceName)}
                      </span>
                      <span className="font-mono text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {job.trackingNumber}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      {t('customer')}: {job.customerName}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/40">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-400">
                    {new Date(job.completedAt || job.updatedAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'ml' ? 'ml-IN' : 'en-IN')}
                  </span>
                </div>
              </div>
            ))}

          {jobs.length === 0 && (
            <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
              <Bell className="w-10 h-10 text-slate-300" />
              <span className="font-bold text-slate-600 text-sm">{t('noNotificationsTitle')}</span>
              <p className="max-w-xs">
                {t('noNotificationsDesc')}
              </p>
            </div>
          )}
        </div>
      </>
    )}
      </div>
    </WorkerShell>
  );
}
