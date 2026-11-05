'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  Search,
  Plus,
  RefreshCw,
  Calendar,
  Users,
  AlertCircle,
  X,
  Send,
  Trash2,
  Tag,
  Loader2,
} from 'lucide-react';
import { ConfirmationModal } from '@/components/Admin/confirmation-modal';
import { AdminDropdown, AdminDropdownOption } from '@/components/Admin/admin-dropdown';
import { announcementService, type Announcement } from '@/services/announcement.service';
import { useToast } from '@/context/toast-context';

const AUDIENCE_OPTIONS: AdminDropdownOption[] = [
  { value: 'ALL', label: 'All Personnel', badge: 'Company-wide' },
  {
    value: 'WORKERS',
    label: 'Field Workers Only',
    badge: 'Field squad',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  },
  {
    value: 'OFFICE_STAFF',
    label: 'Office Staff Only',
    badge: 'HQ / Desk',
    badgeColor: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  },
  {
    value: 'CUSTOMERS',
    label: 'Customers Only',
    badge: 'Clients',
    badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  },
];

const PRIORITY_OPTIONS: AdminDropdownOption[] = [
  { value: 'Low', label: 'Low Priority', badge: 'Informational' },
  { value: 'Normal', label: 'Normal Priority', badge: 'Standard' },
  {
    value: 'High',
    label: 'Urgent Alert',
    badge: 'Critical',
    badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  },
];

export default function AdminAnnouncementsPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const { isDark } = useAdminTheme();
  const router = useRouter();
  const toast = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<'ALL' | 'OFFICE_STAFF' | 'WORKERS' | 'CUSTOMERS'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // New Announcement Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAudience, setNewAudience] = useState<'ALL' | 'OFFICE_STAFF' | 'WORKERS' | 'CUSTOMERS'>('ALL');
  const [newPriority, setNewPriority] = useState<'Low' | 'Normal' | 'High'>('Normal');
  const [isCreating, setIsCreating] = useState(false);

  const fetchAnnouncements = async () => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const data = await announcementService.getAllForAdmin(token);
      setAnnouncements(data);
    } catch (err: any) {
      toast.error('Failed to load announcements');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!token || user?.role !== 'SUPER_ADMIN') {
        router.push('/admin/login');
      } else {
        fetchAnnouncements();
      }
    }
  }, [authLoading, token, user, router]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !token) return;
    setIsCreating(true);

    try {
      const created = await announcementService.create(token, {
        title: newTitle.trim(),
        content: newContent.trim(),
        target: newAudience,
        priority: newPriority,
        isPublished: true,
      });
      
      setAnnouncements([created, ...announcements]);
      setIsModalOpen(false);
      setNewTitle('');
      setNewContent('');
      toast.success('Announcement broadcasted successfully');
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create announcement');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    const target = announcements.find((a) => a.id === id);
    if (target) {
      setDeleteTarget(target);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !token) return;
    try {
      await announcementService.delete(token, deleteTarget.id);
      const updated = announcements.filter((a) => a.id !== deleteTarget.id);
      setAnnouncements(updated);
      toast.success('Announcement removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete announcement');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchAudience = audienceFilter === 'ALL' || a.target === audienceFilter;
      const matchSearch =
        searchTerm === '' ||
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.content.toLowerCase().includes(searchTerm.toLowerCase());
      return matchAudience && matchSearch;
    });
  }, [announcements, audienceFilter, searchTerm]);

  return (
    <div className={`space-y-6 max-w-[1400px] mx-auto pb-10 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <div
              className={`p-2.5 rounded-[24px] border flex items-center justify-center ${
                isDark ? 'bg-[#12141A] border-white/[0.08] text-[#6366F1]' : 'bg-white border-slate-200 text-[#6366F1] shadow-xs'
              }`}
            >
              <Megaphone className="w-5 h-5" />
            </div>
            Announcements &amp; Broadcasts
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Send important operational updates and alerts to workers, office staff, or customers
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#5254E0] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-md shadow-[#6366F1]/20 transition-all ml-auto sm:ml-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
          isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-full text-xs sm:text-sm border transition-colors outline-none ${
              isDark
                ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500 focus:border-[#FF5C38]/50'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF5C38]/50'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {(['ALL', 'WORKERS', 'OFFICE_STAFF'] as const).map((aud) => (
            <button
              key={aud}
              onClick={() => setAudienceFilter(aud)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                audienceFilter === aud
                  ? 'bg-[#FF5C38] text-white shadow-sm'
                  : isDark
                  ? 'bg-[#121318] hover:bg-[#1E2028] text-zinc-400 hover:text-white border border-white/[0.06]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
              }`}
            >
              {aud === 'ALL' ? 'All Audiences' : aud === 'WORKERS' ? 'Field Workers' : 'Office Staff'}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div
            className={`p-12 text-center text-xs rounded-3xl border ${
              isDark ? 'bg-[#181A20] border-white/[0.06] text-zinc-400' : 'bg-white border-slate-200 text-slate-500 shadow-xs'
            }`}
          >
            No announcements found matching this criteria.
          </div>
        ) : (
          filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-3xl border space-y-3.5 transition-all ${
                isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        item.priority === 'High'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : item.priority === 'Normal'
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : isDark ? 'bg-[#121318] text-zinc-400 border-white/[0.06]' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.priority}
                    </span>

                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      isDark ? 'bg-[#121318] border-white/[0.06] text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      Audience: {item.target === 'ALL' ? 'All Personnel' : item.target}
                    </span>

                    <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isDark ? 'text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className={`text-xs leading-relaxed p-4 rounded-2xl border ${
                isDark ? 'bg-[#121318] border-white/[0.06] text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                {item.content}
              </p>

              <div className={`flex items-center justify-between text-[11px] pt-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                <span>Published by: {item.creator?.name || item.creator?.username || 'Super Admin'}</span>
                <span>KK Group Regional Dispatch Network</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4 text-xs ${
              isDark ? 'bg-[#181A20] border-white/[0.1] text-zinc-200' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FF5C38]/15 text-[#FF5C38] flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Publish Announcement</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-1.5 rounded-full hover:bg-white/10 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className={`block mb-1.5 font-semibold uppercase tracking-wider text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Announcement Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monsoon Safety Guidelines & Work Protocols"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className={`w-full rounded-2xl px-4 py-2.5 text-xs border outline-none ${
                    isDark
                      ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500 focus:border-[#FF5C38]/50'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF5C38]/50'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1.5 font-semibold uppercase tracking-wider text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Target Audience *
                  </label>
                  <AdminDropdown
                    options={AUDIENCE_OPTIONS}
                    value={newAudience}
                    onChange={(val) => setNewAudience(val as any)}
                    variant="coral"
                    size="md"
                  />
                </div>

                <div>
                  <label className={`block mb-1.5 font-semibold uppercase tracking-wider text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Priority Level *
                  </label>
                  <AdminDropdown
                    options={PRIORITY_OPTIONS}
                    value={newPriority}
                    onChange={(val) => setNewPriority(val as any)}
                    variant="coral"
                    size="md"
                  />
                </div>
              </div>

              <div>
                <label className={`block mb-1.5 font-semibold uppercase tracking-wider text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Notice Details / Message *
                </label>
                <textarea
                  rows={4}
                  placeholder="Type announcement instructions, safety guidelines, or schedule details..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  className={`w-full rounded-2xl px-4 py-2.5 text-xs border outline-none resize-none ${
                    isDark
                      ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500 focus:border-[#FF5C38]/50'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF5C38]/50'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end gap-3 pt-3 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                    isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 bg-[#FF5C38] hover:bg-[#FF6B4A] disabled:opacity-50 text-white px-5 py-2.5 rounded-full text-xs font-semibold transition-all shadow-lg shadow-[#FF5C38]/20 cursor-pointer"
                >
                  {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isCreating ? 'Publishing...' : 'Publish Notice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Announcement Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Announcement"
        message="Are you sure you want to permanently delete this broadcast announcement? It will immediately disappear from staff and worker noticeboards."
        confirmText="Delete Notice"
        variant="danger"
        itemDetails={
          deleteTarget
            ? [
                { label: 'Title', value: deleteTarget.title },
                { label: 'Audience', value: deleteTarget.target },
                { label: 'Priority', value: deleteTarget.priority },
              ]
            : undefined
        }
      />
    </div>
  );
}
