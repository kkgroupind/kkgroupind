'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown, Loader2 } from 'lucide-react';
import {
  adminDashboardService,
  type PerformanceInterval,
  type PerformanceItem,
} from '@/services/Admin/dashboard/dashboard.service';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className={`p-3.5 rounded-2xl shadow-2xl border text-xs min-w-[170px] ${
          isDark
            ? 'bg-[#181A20] border-white/[0.08] text-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
            : 'bg-white border-slate-200 text-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.1)]'
        }`}
      >
        <p className="font-bold text-xs uppercase tracking-wider text-[#FF5C38] pb-1.5 mb-1.5 border-b border-white/[0.08]">
          {label}
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-gray-400">Total Orders:</span>
            <span className="font-extrabold text-white dark:text-white">{data.total}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-gray-400">Completed Works:</span>
            <span className="font-extrabold text-[#FF5C38]">{data.completed}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function PerformanceChart() {
  const { token } = useAuth();
  const { isDark } = useAdminTheme();
  const [interval, setInterval] = useState<PerformanceInterval>('monthly');
  const [data, setData] = useState<PerformanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    adminDashboardService
      .getPerformance(token, interval)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error('Failed to load performance data', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token, interval]);

  return (
    <div
      className={`p-5 sm:p-6 rounded-[28px] border h-full flex flex-col min-w-0 w-full overflow-hidden transition-all duration-200 ${
        isDark
          ? 'bg-[#12141A] border-white/[0.06] shadow-sm'
          : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      {/* Header (Exact Reference Design: Monthly Sales Performance with Legend) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 relative">
        <div>
          <h3
            className={`font-bold text-sm sm:text-base tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Monthly Performance Trends
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Operational completion rates &amp; orders
          </p>
        </div>

        {/* Legend & Interval Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-0.5 bg-[#FF5C38] rounded-full" />
              Completed
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-0.5 bg-[#6366F1] rounded-full" />
              Enquiries
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#121318] hover:bg-[#20222A] border-white/[0.08] text-gray-300'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              <span className="capitalize">{interval}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {isDropdownOpen && (
              <div
                className={`absolute right-0 top-full mt-2 w-32 rounded-2xl border shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 ${
                  isDark
                    ? 'bg-[#181A20] border-white/[0.08] shadow-[0_10px_25px_rgba(0,0,0,0.5)]'
                    : 'bg-white border-slate-200 shadow-[0_10px_25px_rgba(0,0,0,0.1)]'
                }`}
              >
                {(['weekly', 'monthly', 'yearly'] as PerformanceInterval[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setInterval(opt);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      interval === opt
                        ? 'text-[#FF5C38] bg-[#FF5C38]/10 font-bold'
                        : isDark
                        ? 'text-gray-300 hover:bg-white/5'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="capitalize">{opt}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Line Curved Chart (Matching Reference Monthly Sales Performance) */}
      <div className="h-64 sm:h-72 flex-1 w-full min-w-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#FF5C38] animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="coralArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5C38" stopOpacity={0.25} />
                  <stop offset="90%" stopColor="#FF5C38" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="indigoArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="90%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="0 0"
                vertical={false}
                stroke={isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'}
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? '#7E8B9F' : '#64748B', fontSize: 11 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? '#7E8B9F' : '#64748B', fontSize: 11 }}
                allowDecimals={false}
              />

              <Tooltip
                content={<CustomTooltip isDark={isDark} />}
                cursor={{
                  stroke: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
              />

              <Area
                type="monotone"
                dataKey="completed"
                stroke="#FF5C38"
                strokeWidth={2.5}
                fill="url(#coralArea)"
                activeDot={{
                  r: 5,
                  fill: '#FF5C38',
                  stroke: isDark ? '#181A20' : '#FFFFFF',
                  strokeWidth: 2,
                }}
              />

              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366F1"
                strokeWidth={2}
                fill="url(#indigoArea)"
                activeDot={{
                  r: 5,
                  fill: '#6366F1',
                  stroke: isDark ? '#181A20' : '#FFFFFF',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
