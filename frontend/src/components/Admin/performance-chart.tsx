'use client';
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown } from 'lucide-react';
import type { MonthlyTrendItem } from '@/services/Admin/dashboard/dashboard.service';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#2A2D35]/90 backdrop-blur-sm text-gray-200 p-4 rounded-xl text-xs shadow-xl border border-gray-700 w-48">
        <p className="font-semibold text-gray-400 mb-2">{label}</p>
        <div className="space-y-1.5">
           <div className="flex justify-between items-center">
              <span>New Customers</span>
              <span className="font-bold">{data.customers}</span>
           </div>
           <div className="flex justify-between items-center">
              <span>New Employees</span>
              <span className="font-bold">{data.employees}</span>
           </div>
           <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <span>Total Growth</span>
              <span className="font-bold text-[#A881FF]">{data.total}</span>
           </div>
        </div>
      </div>
    );
  }
  return null;
};

interface PerformanceChartProps {
  trends?: MonthlyTrendItem[];
}

export function PerformanceChart({ trends }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!trends || trends.length === 0) {
      // Default fallback
      return [
        { name: 'Jan', total: 0, customers: 0, employees: 0 },
        { name: 'Feb', total: 0, customers: 0, employees: 0 },
      ];
    }
    return trends.map((t) => ({
      name: t.label, // e.g. 'Jun 2024'
      total: t.total,
      customers: t.customers,
      employees: t.employees,
    }));
  }, [trends]);

  return (
    <div className="bg-[#14151A] p-6 rounded-2xl border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-200">User Growth Trends</h3>
        <button className="flex items-center gap-2 bg-[#1A1C23] border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors">
          Monthly
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A881FF" stopOpacity={1}/>
                <stop offset="100%" stopColor="#4A1C40" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" opacity={0.5} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1F2937', opacity: 0.2 }} />
            <Bar dataKey="total" fill="url(#colorValue)" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
