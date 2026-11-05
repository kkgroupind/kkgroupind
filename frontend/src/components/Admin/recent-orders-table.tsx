'use client';

import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { useAdminTheme } from '@/context/admin-theme-context';

const orders = [
  {
    id: '#878909',
    date: '2 Dec 2026',
    customer: 'Oliver John Brown',
    category: 'Cococare Palm Harvesting',
    status: 'Pending',
    items: '2 Items',
    total: '₹7,890.00',
  },
  {
    id: '#878910',
    date: '1 Dec 2026',
    customer: 'Noah James Smith',
    category: 'JCB 3DX Excavator 8h Shift',
    status: 'Completed',
    items: '3 Items',
    total: '₹9,670.00',
  },
];

export function RecentOrdersTable() {
  const { isDark } = useAdminTheme();

  return (
    <div
      className={`rounded-[28px] border overflow-hidden ${
        isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className={`p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b ${
        isDark ? 'border-white/[0.06]' : 'border-slate-100'
      }`}>
        <h3 className={`font-bold text-base sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Orders</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search orders..."
              className={`w-full pl-9 pr-4 py-2 rounded-full text-xs sm:text-sm border focus:outline-none focus:border-[#FF5C38] ${
                isDark ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
          <button
            className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs sm:text-sm font-semibold transition-colors ${
              isDark
                ? 'border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:text-white'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Sort by</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className={`w-full text-sm text-left ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
          <thead
            className={`text-xs uppercase tracking-wider border-b ${
              isDark ? 'bg-[#14151B] border-white/[0.06] text-zinc-400' : 'bg-slate-50 border-slate-100 text-slate-500'
            }`}
          >
            <tr>
              <th scope="col" className="p-4 pl-6">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#FF5C38] accent-[#FF5C38] rounded"
                />
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">Order Id</th>
              <th scope="col" className="px-6 py-4 font-semibold">Date</th>
              <th scope="col" className="px-6 py-4 font-semibold">Customer</th>
              <th scope="col" className="px-6 py-4 font-semibold">Category</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Status</th>
              <th scope="col" className="px-6 py-4 font-semibold">Items</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-slate-100'}`}>
            {orders.map((order, index) => (
              <tr
                key={index}
                className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/80'}`}
              >
                <td className="w-4 p-4 pl-6">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#FF5C38] accent-[#FF5C38] rounded"
                  />
                </td>
                <td className={`px-6 py-4 font-mono font-semibold ${isDark ? 'text-[#FF5C38]' : 'text-[#FF5C38]'}`}>
                  {order.id}
                </td>
                <td className="px-6 py-4 text-xs font-mono">{order.date}</td>
                <td className={`px-6 py-4 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {order.customer}
                </td>
                <td className="px-6 py-4">{order.category}</td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                      order.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{order.items}</td>
                <td className={`px-6 py-4 font-bold text-right font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {order.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
