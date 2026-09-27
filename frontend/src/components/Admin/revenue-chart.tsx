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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#14151A] text-white border border-gray-700 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xl relative">
        ₹{payload[0].value.toLocaleString()}
      </div>
    );
  }
  return null;
};

export function RevenueChart() {
  const [period, setPeriod] = useState('THIS_WEEK');

  return (
    <div className="group bg-[#14151A] p-6 rounded-2xl border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7B4DFF]/40 to-transparent group-hover:via-[#7B4DFF]/80 transition-all duration-300" />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-gray-100 text-base">Revenue Analytics</h3>
          <p className="text-gray-500 text-xs">Cash flow &amp; operations revenue generation</p>
        </div>
        <div className="w-40">
          <AdminDropdown
            options={periodOptions}
            value={period}
            onChange={(val) => setPeriod(val)}
            variant="purple"
            size="sm"
          />
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="revenue" radius={[12, 12, 12, 12]} barSize={36}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.name === 'Sun' ? '#7B4DFF' : '#4f46e5'}
                  style={{ opacity: entry.name === 'Sun' ? 1 : 0.8 }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
