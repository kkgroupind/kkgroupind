'use client';

import React from 'react';
import NextLink from 'next/link';
import {
  Trash2,
  Loader2,
  Mail,
  Calendar,
  Shield,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Phone,
  Pencil,
} from 'lucide-react';
import { User } from '@/services';
import { useAdminTheme } from '@/context/admin-theme-context';

interface PeopleCardsProps {
  people: User[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
  onPageChange?: (page: number) => void;
  onEdit?: (person: User) => void;
  onDelete: (id: string) => void;
  isDeleting: string | null;
  basePath?: string;
}

export function PeopleCards({
  people,
  meta,
  onPageChange,
  onEdit,
  onDelete,
  isDeleting,
  basePath,
}: PeopleCardsProps) {
  const { isDark } = useAdminTheme();

  if (people.length === 0) {
    return (
      <div
        className={`rounded-[28px] border p-12 text-center flex flex-col items-center justify-center ${
          isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 ${
            isDark ? 'bg-[#121318] border-white/[0.06] text-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}
        >
          <Shield className="w-7 h-7" />
        </div>
        <h3 className={`font-semibold text-base mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>No members found</h3>
        <p className={`text-sm max-w-sm ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
          No users match the selected filter or search criteria.
        </p>
      </div>
    );
  }

  const getProfileHref = (person: User) => {
    if (basePath) {
      return `${basePath}/${person.username}`;
    }
    const roleMap: Record<string, string> = {
      CUSTOMER: '/admin/people/customers',
      WORKER: '/admin/people/workers',
      OFFICE_STAFF: '/admin/people/office-staff',
    };
    const prefix = roleMap[person.role] || '/admin/people/customers';
    return `${prefix}/${person.username}`;
  };

  const getRoleTheme = (role: string) => {
    switch (role) {
      case 'WORKER':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-500',
          border: 'border-emerald-500/20',
          ring: 'from-emerald-500 to-teal-600',
        };
      case 'OFFICE_STAFF':
        return {
          bg: 'bg-[#6366F1]/10',
          text: 'text-[#818CF8]',
          border: 'border-[#6366F1]/20',
          ring: 'from-[#6366F1] to-indigo-600',
        };
      case 'CUSTOMER':
      default:
        return {
          bg: 'bg-[#FF5C38]/10',
          text: 'text-[#FF5C38]',
          border: 'border-[#FF5C38]/20',
          ring: 'from-[#FF5C38] to-[#FF8A65]',
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {people.map((person) => {
          const theme = getRoleTheme(person.role);
          const formattedDate = person.createdAt
            ? new Date(person.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : 'Unknown';
          const profileHref = getProfileHref(person);
          const initial = (person.username?.charAt(0) || 'U').toUpperCase();

          return (
            <div
              key={person.id}
              className={`group rounded-[28px] border transition-all duration-300 flex flex-col justify-between p-5 sm:p-6 ${
                isDark
                  ? 'bg-[#12141A] border-white/[0.06] hover:border-white/[0.14] hover:shadow-xl'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                {/* Header: Avatar, Name/Username, Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5">
                    {/* Avatar with deterministic gradient ring */}
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.ring} p-[2px] shadow-xs`}
                      >
                        <div
                          className={`w-full h-full rounded-[14px] flex items-center justify-center font-bold text-base overflow-hidden ${
                            isDark ? 'bg-[#121318] text-white' : 'bg-white text-slate-900'
                          }`}
                        >
                          {person.avatar ? (
                            <img
                              src={person.avatar}
                              alt={person.name || person.username || 'Avatar'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : null}
                          {!person.avatar && <span>{initial}</span>}
                        </div>
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                          isDark ? 'border-[#181A20]' : 'border-white'
                        } ${person.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        title={person.isActive ? 'Active' : 'Inactive'}
                      />
                    </div>

                    <div className="min-w-0">
                      <NextLink
                        href={profileHref}
                        className={`font-semibold transition-colors truncate block text-base group-hover:text-[#FF5C38] ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {person.name || person.username}
                      </NextLink>
                      <p className={`text-xs font-mono truncate ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                        @{person.username}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${theme.bg} ${theme.text} ${theme.border} uppercase tracking-wider`}
                  >
                    {person.role.replace('_', ' ')}
                  </span>
                </div>

                {/* Details List */}
                <div className={`space-y-2 py-3 border-y my-3 text-xs ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  {/* Email */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`flex items-center gap-2 truncate ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{person.email || 'No email provided'}</span>
                    </span>
                    {person.email && (
                      <span className="shrink-0 flex items-center gap-1 text-[11px]">
                        {person.isEmailVerified ? (
                          <span className="text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-amber-500 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  {person.phone && (
                    <div className={`flex items-center justify-between gap-2 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      <span className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate font-mono">{person.phone}</span>
                      </span>
                    </div>
                  )}

                  {/* Joined Date */}
                  <div className={`flex items-center justify-between ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Joined</span>
                    </span>
                    <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{formattedDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-2 gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(person)}
                    className={`p-2 rounded-full border transition-all cursor-pointer ${
                      isDark
                        ? 'text-zinc-400 hover:text-[#FF5C38] hover:bg-[#FF5C38]/10 border-transparent hover:border-[#FF5C38]/20'
                        : 'text-slate-500 hover:text-[#FF5C38] hover:bg-[#FF5C38]/10 border-transparent hover:border-[#FF5C38]/20'
                    }`}
                    title="Edit user details"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}

                <NextLink
                  href={profileHref}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                    isDark
                      ? 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border-white/[0.06]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                >
                  <span>View Profile</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </NextLink>

                <button
                  type="button"
                  onClick={() => onDelete(person.id)}
                  disabled={isDeleting === person.id}
                  title="Delete user"
                  className="p-2 rounded-full text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting === person.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div
          className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border text-xs sm:text-sm ${
            isDark ? 'bg-[#181A20] border-white/[0.06] text-zinc-400' : 'bg-white border-slate-200 text-slate-600 shadow-xs'
          }`}
        >
          <p>
            Showing{' '}
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {(meta.page - 1) * meta.limit + 1}
            </span>{' '}
            to{' '}
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {Math.min(meta.page * meta.limit, meta.total)}
            </span>{' '}
            of <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{meta.total}</span> members
          </p>

          <div className="flex items-center gap-2">
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
            <span className={`text-xs px-2 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Page {meta.page} of {meta.totalPages}
            </span>
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
