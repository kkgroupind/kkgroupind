'use client';
import React from 'react';
import NextLink from 'next/link';
import { Trash2, Loader2, MoreHorizontal, ExternalLink, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { User } from '@/services';

interface PeopleTableProps {
  people: User[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
  onPageChange?: (page: number) => void;
  onEdit?: (person: User) => void;
  onDelete: (id: string) => void;
  isDeleting: string | null;
  basePath?: string;
}

export function PeopleTable({ people, meta, onPageChange, onEdit, onDelete, isDeleting, basePath }: PeopleTableProps) {
  if (people.length === 0) {
    return (
      <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-8 text-center flex flex-col items-center justify-center">
        <p className="text-gray-500">No members found.</p>
      </div>
    );
  }

  const getProfileHref = (person: User) => {
    if (basePath) return `${basePath}/${person.username}`;
    const roleMap: Record<string, string> = {
      CUSTOMER: '/admin/people/customers',
      WORKER: '/admin/people/workers',
      OFFICE_STAFF: '/admin/people/office-staff',
    };
    return `${roleMap[person.role] || '/admin/people/customers'}/${person.username}`;
  };

  return (
    <div className="bg-[#14151A] rounded-2xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-500 bg-[#1A1C23] border-b border-gray-800/50">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">User / Email</th>
              <th scope="col" className="px-6 py-4 font-medium">Role</th>
              <th scope="col" className="px-6 py-4 font-medium text-center">Status</th>
              <th scope="col" className="px-6 py-4 font-medium">Joined Date</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => {
              const profileHref = getProfileHref(person);
              return (
                <tr key={person.id} className="hover:bg-[#1A1C23] transition-colors border-b border-gray-800/30 last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-xs font-bold text-[#7B4DFF] overflow-hidden shrink-0 border border-gray-700/60 shadow-sm">
                        {person.avatar ? (
                          <img
                            src={person.avatar}
                            alt={person.name || person.username || 'User avatar'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        {(!person.avatar) && (
                          <span>
                            {person.name?.charAt(0).toUpperCase() ||
                              person.username?.charAt(0).toUpperCase() ||
                              'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <NextLink
                          href={profileHref}
                          className="font-medium text-gray-200 hover:text-[#7B4DFF] transition-colors"
                        >
                          {person.name || `@${person.username}`}
                        </NextLink>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span className="font-mono text-gray-400">@{person.username}</span>
                          {person.phone && (
                            <>
                              <span className="text-gray-600">•</span>
                              <span className="text-gray-400">{person.phone}</span>
                            </>
                          )}
                        </div>
                        {person.email && (
                          <span className="text-[11px] text-gray-500 truncate max-w-[200px]">
                            {person.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-[#2A2D35] text-gray-300 rounded-md text-xs font-medium border border-gray-700">
                      {person.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${person.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-gray-300">{person.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(person.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(person)}
                          className="p-2 text-gray-400 hover:text-[#7B4DFF] hover:bg-[#7B4DFF]/10 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Edit User Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      <NextLink
                        href={profileHref}
                        className="p-2 text-gray-400 hover:text-white hover:bg-[#2A2D35] rounded-lg transition-colors inline-flex items-center justify-center"
                        title="View Profile Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </NextLink>
                      <button
                        onClick={() => onDelete(person.id)}
                        disabled={isDeleting === person.id}
                        className="p-2 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete User"
                      >
                        {isDeleting === person.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {meta && meta.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-800/50 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing <span className="text-gray-300 font-medium">{Math.min((meta.page - 1) * meta.limit + 1, meta.total)}</span> to <span className="text-gray-300 font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="text-gray-300 font-medium">{meta.total}</span> entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(meta.page - 1)}
              disabled={meta.page <= 1}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#2A2D35] rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    pageNum === meta.page
                      ? 'bg-[#7B4DFF] text-white'
                      : 'text-gray-400 hover:bg-[#2A2D35] hover:text-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              onClick={() => onPageChange?.(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#2A2D35] rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
