'use client';
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';
import type { RoleBreakdownItem } from '@/services/Admin/dashboard/dashboard.service';

interface AttendanceChartProps {
  roleBreakdown?: RoleBreakdownItem[];
}

export function AttendanceChart({ roleBreakdown }: AttendanceChartProps) {
  const chartData = useMemo(() => {
    if (!roleBreakdown || roleBreakdown.length === 0) {
      return [
        { name: 'Customers', value: 1, color: '#3B82F6' },
        { name: 'Workers', value: 1, color: '#2A835F' },
        { name: 'Office Staff', value: 1, color: '#F59E0B' },
      ];
    }

    const colorMap: Record<string, string> = {
      CUSTOMER: '#3B82F6', // Blue
      WORKER: '#2A835F', // Green
      OFFICE_STAFF: '#F59E0B', // Amber
      SUPER_ADMIN: '#7B4DFF', // Purple
    };

    return roleBreakdown.map((r) => ({
      name: r.role.replace('_', ' '),
      value: r.count,
      color: colorMap[r.role] || '#8884d8',
    }));
  }, [roleBreakdown]);

  const totalUsers = useMemo(() => {
    if (!roleBreakdown || roleBreakdown.length === 0) return 0;
    return roleBreakdown.reduce((sum, r) => sum + r.count, 0);
  }, [roleBreakdown]);

  return (
    <div className="bg-[#14151A] p-6 rounded-2xl border border-gray-800 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-200">User Roles Distribution</h3>
        <button className="flex items-center gap-2 bg-[#1A1C23] border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400">
          <Users className="w-3 h-3 text-[#2A835F]" />
          All Roles
        </button>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8">
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={3}
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
            <span className="text-2xl font-bold text-gray-100">
              {totalUsers}
            </span>
            <span className="text-xs text-gray-500">Total Users</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-400 capitalize">
                <div
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name.toLowerCase()}</span>
              </div>
              <div className="font-bold text-gray-200 text-sm">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full mt-6 py-2.5 rounded-xl border border-gray-800 bg-[#1A1C23] text-gray-400 text-xs font-medium text-center">
        Live Platform Statistics
      </div>
    </div>
  );
}
