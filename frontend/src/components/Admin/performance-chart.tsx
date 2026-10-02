'use client';
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown, Loader2 } from 'lucide-react';
import { adminDashboardService, type PerformanceInterval, type PerformanceItem } from '@/services/Admin/dashboard/dashboard.service';
import { useAuth } from '@/context/auth-context';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#2A2D35]/90 backdrop-blur-sm text-gray-200 p-4 rounded-xl text-xs shadow-xl border border-gray-700 w-48">
        <p className="font-semibold text-gray-400 mb-2">{label}</p>
        <div className="space-y-1.5">
           <div className="flex justify-between items-center">
              <span>Total Enquiries</span>
              <span className="font-bold">{data.total}</span>
           </div>
           <div className="flex justify-between items-center">
              <span>Completed Works</span>
              <span className="font-bold text-[#A881FF]">{data.completed}</span>
           </div>
        </div>
      </div>
    );
  }
  return null;
};

export function PerformanceChart() {
  const { token } = useAuth();
  const [interval, setInterval] = useState<PerformanceInterval>('weekly');
  const [data, setData] = useState<PerformanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    adminDashboardService.getPerformance(token, interval)
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
    <div className="bg-[#14151A] p-4 sm:p-6 rounded-2xl border border-gray-800 h-full flex flex-col min-w-0 w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 sm:mb-6 relative">
        <h3 className="font-semibold text-gray-200 text-sm sm:text-base">Operations Performance</h3>
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-[#1A1C23] border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors"
          >
            <span className="capitalize">{interval}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-32 bg-[#1A1C23] border border-gray-800 rounded-xl shadow-xl overflow-hidden z-10">
              {['weekly', 'monthly', 'yearly'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setInterval(opt as PerformanceInterval);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-[#252830] transition-colors ${interval === opt ? 'text-[#A881FF] font-bold bg-[#A881FF]/10' : 'text-gray-300'}`}
                >
                  <span className="capitalize">{opt}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="h-64 flex-1 w-full min-w-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A881FF" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#4A1C40" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" opacity={0.5} />
              <XAxis
                dataKey="label"
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
              <Bar dataKey="total" fill="url(#colorValue)" radius={[4, 4, 0, 0]} barSize={interval === 'yearly' ? 24 : 12} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
