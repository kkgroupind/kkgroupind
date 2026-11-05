'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, MoreVertical } from 'lucide-react';
import type { DashboardOverview } from '@/services/Admin/dashboard/dashboard.service';
import { useAdminTheme } from '@/context/admin-theme-context';

interface AttendanceChartProps {
  attendance?: DashboardOverview['attendance'];
}

export function AttendanceChart({ attendance }: AttendanceChartProps) {
  const { isDark } = useAdminTheme();

  const chartData = useMemo(() => {
    if (!attendance) {
      return [
        { name: 'Available On-Duty', value: 1, color: '#FF5C38' },
        { name: 'Engaged on Job', value: 1, color: '#6366F1' },
        { name: 'Off Duty / Leave', value: 1, color: '#2A835F' },
      ];
    }
    return [
      { name: 'Available On-Duty', value: attendance.present, color: '#FF5C38' },
      { name: 'Engaged on Job', value: attendance.busy, color: '#6366F1' },
      { name: 'Off Duty / Leave', value: attendance.onLeave, color: '#2A835F' },
    ];
  }, [attendance]);

  const totalWorkers = attendance?.total || 0;
  const activePercentage =
    totalWorkers > 0
      ? Math.round((((attendance?.present || 0) + (attendance?.busy || 0)) / totalWorkers) * 100)
      : 100;

  return (
    <div
      className={`p-5 sm:p-6 rounded-[28px] border flex flex-col justify-between h-full transition-all duration-200 ${
        isDark
          ? 'bg-[#12141A] border-white/[0.06] shadow-sm'
          : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3
            className={`font-bold text-sm sm:text-base tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Workforce Active Duty
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Availability by time &amp; status
          </p>
        </div>

        <button
          type="button"
          aria-label="Options"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isDark
              ? 'text-gray-400 hover:text-white hover:bg-white/5'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Chart Visual & Legend */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
        {/* Left: Legend List */}
        <div className="space-y-3 w-full sm:w-auto">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span
                  className={`text-xs font-semibold ${
                    isDark ? 'text-gray-300' : 'text-slate-600'
                  }`}
                >
                  {item.name}
                </span>
              </div>
              <span
                className={`font-bold text-xs ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Circular Donut */}
        <div className="relative w-44 h-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className={`text-xs uppercase font-bold tracking-wider ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}
            >
              Active
            </span>
            <span
              className={`text-2xl font-black leading-none mt-0.5 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {activePercentage}%
            </span>
            <span className="text-[10px] text-gray-500 font-mono mt-1">
              {totalWorkers} Total
            </span>
          </div>
        </div>
      </div>

      {/* Footer Status Pill */}
      <div
        className={`w-full mt-3 py-2 px-3 rounded-xl border text-[11px] font-medium text-center flex items-center justify-center gap-2 ${
          isDark
            ? 'border-white/[0.06] bg-[#121318] text-gray-400'
            : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#FF5C38] animate-pulse" />
        <span>Kasaragod Dispatch Operations Live</span>
      </div>
    </div>
  );
}
