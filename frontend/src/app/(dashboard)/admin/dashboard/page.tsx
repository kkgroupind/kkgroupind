'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronDown, Sparkles, Settings, Globe, MapPin, Layers, IndianRupee, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/Admin/stat-card';
import { PerformanceChart } from '@/components/Admin/performance-chart';
import { AttendanceChart } from '@/components/Admin/attendance-chart';
import { EmployeesTable } from '@/components/Admin/employees-table';
import { useAuth } from '@/context/auth-context';
import { EnquiryService, ServiceEnquiry } from '@/services';
import { adminDashboardService, type DashboardOverview } from '@/services/Admin/dashboard/dashboard.service';

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [pendingPayoutCount, setPendingPayoutCount] = useState<number>(0);
  const [totalJobOrders, setTotalJobOrders] = useState<number>(0);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);

  useEffect(() => {
    if (!token) return;
    EnquiryService.getAllEnquiries({}, token)
      .then((res) => {
        const unpaid = (res.enquiries || []).filter(
          (w) => w.status === 'COMPLETED' && (!w.totalCalculatedWage || Number(w.totalCalculatedWage) === 0),
        );
        setPendingPayoutCount(unpaid.length);
        setTotalJobOrders(res.enquiries ? res.enquiries.length : 0);
      })
      .catch((err) => {
        console.error('Failed to load pending payouts count for admin dashboard', err);
      });

    adminDashboardService.getOverview(token)
      .then((data) => {
        setOverview(data);
      })
      .catch((err) => {
        console.error('Failed to load dashboard stats', err);
      });
  }, [token]);
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
           <h1 className="text-3xl font-bold text-gray-100 tracking-tight mb-1">Dashboard</h1>
           <p className="text-gray-500 text-sm">Here is today's report and performances</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/settings?tab=site"
            className="flex items-center gap-2 bg-[#1A1C23] hover:bg-[#252830] border border-gray-800 hover:border-gray-700 px-4 py-2 rounded-xl text-sm font-medium text-gray-200 hover:text-white transition-all shadow-xs"
          >
            <Settings className="w-4 h-4 text-[#2A835F]" />
            <span>Site Settings</span>
          </Link>
        </div>
      </div>

      {/* Site Settings & Regional Operations Status Banner */}
      <div className="bg-[#14151A] border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#2A835F]/15 border border-[#2A835F]/30 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6 text-[#2A835F]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-gray-100">KK Group Site & Operations</h3>
              <span className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Portal Active
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#2A835F]" />
                Primary Hub: <strong className="text-gray-200">Kasaragod District</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                9 Published Services
              </span>
              <span>•</span>
              <span>Bilingual Support (EN / ML)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/admin/services"
            className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl bg-[#1A1C23] hover:bg-[#252830] border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white transition-all"
          >
            Manage Services
          </Link>
          <Link
            href="/admin/settings?tab=site"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#2A835F] hover:bg-[#236e4f] text-xs font-semibold text-white transition-all shadow-md shadow-[#2A835F]/20"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Site Settings</span>
          </Link>
        </div>
      </div>

      {/* Pending Payout Action Alert */}
      {pendingPayoutCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <IndianRupee className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-gray-100">
                  {pendingPayoutCount} Completed {pendingPayoutCount === 1 ? 'Work' : 'Works'} Awaiting Worker Payout
                </h3>
                <span className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold animate-pulse">
                  Payment Due
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Latest completed jobs without assigned worker payouts. Review completed units and update payments.
              </p>
            </div>
          </div>

          <Link
            href="/admin/operations/work-orders?filter=PENDING_PAYOUT"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 transition-all shadow-sm w-full sm:w-auto"
          >
            <span>Review &amp; Update Payouts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Stats Grid: Double row on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Total Employees"
          value={overview?.stats ? overview.stats.totalEmployees.toString() : '...'}
          trend={overview?.stats && overview.stats.employeeGrowthRate > 0 ? `+${overview.stats.employeeGrowthRate.toFixed(1)}%` : '0%'}
        />
        <StatCard
          title="Total Job Orders"
          value={totalJobOrders > 0 ? totalJobOrders.toString() : '...'}
          trend=""
        />
        <StatCard
          title="New Employees (This Month)"
          value={overview?.stats ? overview.stats.newEmployeesThisMonth.toString() : '...'}
          trend={overview?.stats && overview.stats.employeeGrowthRate > 0 ? `+${overview.stats.employeeGrowthRate.toFixed(1)}%` : '0%'}
        />
        <StatCard
          title="Total Customers"
          value={overview?.stats ? overview.stats.totalCustomers.toString() : '...'}
          trend={overview?.stats && overview.stats.userGrowthRate > 0 ? `+${overview.stats.userGrowthRate.toFixed(1)}%` : '0%'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 min-w-0 w-full overflow-hidden">
          <PerformanceChart />
        </div>
        <div className="lg:col-span-2 min-w-0 w-full overflow-hidden">
          <AttendanceChart attendance={overview?.attendance} />
        </div>
      </div>

      {/* Employees Table */}
      <div>
        <EmployeesTable />
      </div>
    </div>
  );
}
