'use client';
import React from 'react';
import NextLink from 'next/link';
import { Trash2, Loader2, ExternalLink, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { User } from '@/services';
import { useAdminTheme } from '@/context/admin-theme-context';

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
  const { isDark } = useAdminTheme();

  if (people.length === 0) {
    return (
      <div
        className={`rounded-3xl border p-12 text-center flex flex-col items-center justify-center ${
          isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <p className={isDark ? 'text-zinc-500' : 'text-slate-400'}>No members found.</p>
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
    <div
      className={`rounded-[28px] border overflow-hidden ${
        isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="overflow-x-auto custom-scrollbar">
        <table className={`w-full text-sm text-left ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
          <thead
            className={`text-xs uppercase tracking-wider border-b ${
              isDark ? 'bg-[#14151B] border-white/[0.06] text-zinc-400' : 'bg-slate-50 border-slate-100 text-slate-500'
            }`}
          >
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">User / Email</th>
              <th scope="col" className="px-6 py-4 font-semibold">Role</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Status</th>
              <th scope="col" className="px-6 py-4 font-semibold">Joined Date</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-slate-100'}`}>
            {people.map((person) => {
              const profileHref = getProfileHref(person);
              return (
                <tr
                  key={person.id}
                  className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/80'}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`relative w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold overflow-hidden shrink-0 border ${
                          isDark
                            ? 'bg-[#121318] border-white/[0.08] text-[#FF5C38]'
                            : 'bg-slate-100 border-slate-200 text-[#FF5C38]'
                        }`}
                      >
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
                        {!person.avatar && (
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
                          className={`font-semibold transition-colors hover:text-[#FF5C38] ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {person.name || `@${person.username}`}
                        </NextLink>
                        <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                          <span className="font-mono">@{person.username}</span>
                          {person.phone && (
                            <>
                              <span>•</span>
                              <span>{person.phone}</span>
                            </>
                          )}
                        </div>
                        {person.email && (
                          <span className={`text-[11px] truncate max-w-[200px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                            {person.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        person.role === 'WORKER'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : person.role === 'OFFICE_STAFF'
                          ? 'bg-[#6366F1]/10 text-[#818CF8] border-[#6366F1]/20'
                          : 'bg-[#FF5C38]/10 text-[#FF5C38] border-[#FF5C38]/20'
                      }`}
                    >
                      {person.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${person.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className={`text-xs font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        {person.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-xs font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {new Date(person.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(person)}
                          className={`p-2 rounded-full transition-colors cursor-pointer ${
                            isDark
                              ? 'text-zinc-400 hover:text-[#FF5C38] hover:bg-white/[0.04]'
                              : 'text-slate-500 hover:text-[#FF5C38] hover:bg-slate-100'
                          }`}
                          title="Edit User Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      <NextLink
                        href={profileHref}
                        className={`p-2 rounded-full transition-colors ${
                          isDark
                            ? 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title="View Profile Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </NextLink>
                      <button
                        onClick={() => onDelete(person.id)}
                        disabled={isDeleting === person.id}
                        className="p-2 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
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
        <div
          className={`px-6 py-4 border-t flex items-center justify-between text-xs sm:text-sm ${
            isDark ? 'border-white/[0.06] text-zinc-400' : 'border-slate-100 text-slate-500'
          }`}
        >
          <span>
            Showing <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{Math.min((meta.page - 1) * meta.limit + 1, meta.total)}</span> to{' '}
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{Math.min(meta.page * meta.limit, meta.total)}</span> of{' '}
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{meta.total}</span> entries
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange?.(meta.page - 1)}
              disabled={meta.page <= 1}
              className={`p-2 rounded-full border disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer ${
                isDark
                  ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] text-zinc-300'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    pageNum === meta.page
                      ? 'bg-[#FF5C38] text-white shadow-xs'
                      : isDark
                      ? 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              onClick={() => onPageChange?.(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className={`p-2 rounded-full border disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer ${
                isDark
                  ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] text-zinc-300'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
