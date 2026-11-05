'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAdminTheme } from '@/context/admin-theme-context';

const data = [
  { name: 'Jan', profit: 30000, loss: 20000 },
  { name: 'Feb', profit: 40000, loss: 15000 },
  { name: 'Mar', profit: 45000, loss: 12000 },
  { name: 'Apr', profit: 35000, loss: 18000 },
  { name: 'May', profit: 42000, loss: 22000 },
  { name: 'Jun', profit: 48000, loss: 28000 },
  { name: 'Jul', profit: 38000, loss: 18000 },
  { name: 'Aug', profit: 32000, loss: 14000 },
];

export function IncomeChart() {
  const { isDark } = useAdminTheme();

  return (
    <div
      className={`p-6 rounded-[28px] border transition-all ${
        isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      <div className="mb-6">
        <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Income</h3>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Financial volume and profit-loss breakdown</p>
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
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{
                backgroundColor: isDark ? '#181A20' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                borderRadius: '16px',
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
              }}
            />
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="circle"
              wrapperStyle={{ top: -45, fontSize: '11px' }}
            />
            <Bar dataKey="loss" stackId="a" fill={isDark ? '#27272A' : '#CBD5E1'} radius={[0, 0, 8, 8]} barSize={20} name="Expenses" />
            <Bar dataKey="profit" stackId="a" fill="#FF5C38" radius={[8, 8, 0, 0]} barSize={20} name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
