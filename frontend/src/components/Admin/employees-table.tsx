import React from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import type { User } from '@/services/types';

interface EmployeesTableProps {
  recentActivity?: User[];
}

export function EmployeesTable({ recentActivity }: EmployeesTableProps) {
  const displayUsers = recentActivity || [];

  return (
    <div className="bg-[#14151A] rounded-2xl border border-gray-800 overflow-hidden">
      <div className="p-6 flex justify-between items-center border-b border-gray-800/50">
        <h3 className="font-bold text-gray-200 text-lg">Recent Users Activity</h3>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-800 bg-[#1A1C23] rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors">
          All Users
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-500 bg-[#14151A] border-b border-gray-800/50">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Username</th>
              <th scope="col" className="px-6 py-4 font-medium">Name</th>
              <th scope="col" className="px-6 py-4 font-medium">Role</th>
              <th scope="col" className="px-6 py-4 font-medium">Phone / Email</th>
              <th scope="col" className="px-6 py-4 font-medium text-center">Status</th>
              <th scope="col" className="px-6 py-4 font-medium">Verification</th>
            </tr>
          </thead>
          <tbody>
            {displayUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No recent activity
                </td>
              </tr>
            ) : (
              displayUsers.map((user, index) => (
                <tr key={user.id || index} className="bg-[#14151A] hover:bg-[#1A1C23] transition-colors border-b border-gray-800/30 last:border-0">
                  <td className="px-6 py-4 font-medium text-gray-500 whitespace-nowrap">{user.username}</td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                         {user.name ? user.name.charAt(0) : (user.username?.charAt(0) || '?')}
                       </div>
                       <span className="font-medium text-gray-200">{user.name || 'N/A'}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-[#1A1C23] text-gray-300 border border-gray-700 px-2.5 py-1 rounded-md text-[10px] font-bold">
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.phone ? (
                      <span className="text-gray-300">{user.phone}</span>
                    ) : (
                      <span className="text-gray-500 italic">{user.email || 'N/A'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-[#7B4DFF]' : 'bg-gray-500'}`}></div>
                      <span className={user.isActive ? 'text-gray-300' : 'text-gray-500'}>{user.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isEmailVerified ? (
                      <span className="text-emerald-400 font-medium">Verified</span>
                    ) : (
                      <span className="text-amber-500 font-medium">Pending</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
