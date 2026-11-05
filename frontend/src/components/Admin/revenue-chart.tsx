'use client';
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { AdminDropdown, AdminDropdownOption } from '@/components/Admin/admin-dropdown';
import { useAdminTheme } from '@/context/admin-theme-context';

const data = [
  { name: 'Fri', revenue: 17000 },
  { name: 'Sat', revenue: 12000 },
  { name: 'Sun', revenue: 22430 },
  { name: 'Mon', revenue: 13000 },
  { name: 'Thu', revenue: 16000 },
  { name: 'Wen', revenue: 23000 },
  { name: 'Thus', revenue: 16000 },
];

const periodOptions: AdminDropdownOption[] = [
  { value: 'THIS_WEEK', label: 'This Week' },
  { value: 'LAST_WEEK', label: 'Last Week' },
  { value: 'THIS_MONTH', label: 'This Month' },
];

export function RevenueChart() {
  const { isDark } = useAdminTheme();
  const [period, setPeriod] = useState('THIS_WEEK');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-xl ${
          isDark ? 'bg-[#12141A] text-white border-white/[0.08]' : 'bg-white text-slate-900 border-slate-200'
        }`}>
          ₹{payload[0].value.toLocaleString()}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`p-6 rounded-[28px] border transition-all ${
        isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Revenue Analytics</h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Weekly operations revenue performance</p>
        </div>
        <div className="w-36">
          <AdminDropdown
            options={periodOptions}
            value={period}
            onChange={(val) => setPeriod(val)}
            variant="coral"
            size="sm"
          />
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#71717A' : '#94A3B8', fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#71717A' : '#94A3B8', fontSize: 11 }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="revenue" radius={[12, 12, 12, 12]} barSize={28}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.name === 'Sun' ? '#FF5C38' : isDark ? '#27272A' : '#E2E8F0'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
