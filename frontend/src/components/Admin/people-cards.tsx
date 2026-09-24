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
  if (people.length === 0) {
    return (
      <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-12 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-[#1A1C23] border border-gray-800 flex items-center justify-center text-gray-500 mb-4">
          <Shield className="w-7 h-7 text-gray-500" />
        </div>
        <h3 className="text-gray-200 font-semibold text-base mb-1">No members found</h3>
        <p className="text-gray-500 text-sm max-w-sm">
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
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
          ring: 'from-emerald-500 to-teal-600',
        };
      case 'OFFICE_STAFF':
        return {
          bg: 'bg-purple-500/10',
          text: 'text-purple-400',
          border: 'border-purple-500/20',
          ring: 'from-purple-500 to-indigo-600',
        };
      case 'CUSTOMER':
      default:
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          border: 'border-blue-500/20',
          ring: 'from-blue-500 to-cyan-600',
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
              className="group bg-[#14151A] rounded-2xl border border-gray-800/80 hover:border-gray-700/80 p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle top ambient glow */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-700/40 to-transparent group-hover:via-[#7B4DFF]/60 transition-all duration-300" />

              <div>
                {/* Header: Avatar, Name/Username, Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5">
                    {/* Avatar with deterministic gradient ring */}
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.ring} p-[2px] shadow-sm`}
                      >
                        <div className="w-full h-full bg-[#1A1C23] rounded-[14px] flex items-center justify-center font-bold text-base text-gray-100">
                          {initial}
                        </div>
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#14151A] ${
                          person.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        title={person.isActive ? 'Active' : 'Inactive'}
                      />
                    </div>

                    <div className="min-w-0">
                      <NextLink
                        href={profileHref}
                        className="font-semibold text-gray-100 hover:text-[#7B4DFF] transition-colors truncate block text-base"
                      >
                        {person.name || person.username}
                      </NextLink>
                      <p className="text-xs text-gray-500 font-mono truncate">
                        @{person.username}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${theme.bg} ${theme.text} ${theme.border} uppercase tracking-wider`}
                  >
                    {person.role.replace('_', ' ')}
                  </span>
                </div>

                {/* Details List */}
                <div className="space-y-2 py-3 border-y border-gray-800/60 my-3 text-xs">
                  {/* Email */}
                  <div className="flex items-center justify-between text-gray-400 gap-2">
                    <span className="flex items-center gap-2 text-gray-400 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{person.email || 'No email provided'}</span>
                    </span>
                    {person.email && (
                      <span className="shrink-0 flex items-center gap-1 text-[11px] text-gray-400">
                        {person.isEmailVerified ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-amber-400/90 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  {person.phone && (
                    <div className="flex items-center justify-between text-gray-400 gap-2">
                      <span className="flex items-center gap-2 text-gray-400 truncate">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{person.phone}</span>
                      </span>
                    </div>
                  )}

                  {/* Joined Date */}
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Joined</span>
                    </span>
                    <span className="text-gray-300 font-medium">{formattedDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-2 gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(person)}
                    className="p-2 rounded-xl text-gray-400 hover:text-[#7B4DFF] hover:bg-[#7B4DFF]/10 border border-transparent hover:border-[#7B4DFF]/20 transition-all"
                    title="Edit user details"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}

                <NextLink
                  href={profileHref}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#1A1C23] hover:bg-[#252834] text-gray-200 hover:text-white border border-gray-800 transition-all group-hover:border-gray-700"
                >
                  <span>View Profile</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </NextLink>

                <button
                  type="button"
                  onClick={() => onDelete(person.id)}
                  disabled={isDeleting === person.id}
                  title="Delete user"
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all disabled:opacity-50"
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
        <div className="flex items-center justify-between px-4 py-3 bg-[#14151A] rounded-2xl border border-gray-800 text-sm text-gray-400">
          <p>
            Showing{' '}
            <span className="text-gray-200 font-medium">
              {(meta.page - 1) * meta.limit + 1}
            </span>{' '}
            to{' '}
            <span className="text-gray-200 font-medium">
              {Math.min(meta.page * meta.limit, meta.total)}
            </span>{' '}
            of <span className="text-gray-200 font-medium">{meta.total}</span> members
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(meta.page - 1)}
              disabled={meta.page <= 1}
              className="p-2 rounded-lg bg-[#1A1C23] hover:bg-gray-800 border border-gray-800 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 text-gray-300">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              onClick={() => onPageChange?.(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="p-2 rounded-lg bg-[#1A1C23] hover:bg-gray-800 border border-gray-800 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
