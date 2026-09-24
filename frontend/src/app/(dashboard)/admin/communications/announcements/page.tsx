'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
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
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: 'ALL' | 'OFFICE_STAFF' | 'WORKERS';
  priority: 'LOW' | 'NORMAL' | 'URGENT';
  author: string;
  createdAt: string;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Monsoon Heavy Equipment & Tree Trimming Safety Protocol',
    content:
      'All field operatives deploying for high-voltage power line clearances and coconut palm tree harvesting during active rainfall must wear certified non-conductive harness kits. Ensure emergency contact lines are open.',
    audience: 'WORKERS',
    priority: 'URGENT',
    author: 'Super Admin Operations',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'ann-2',
    title: 'Kochi & Kottayam Regional Holiday Desk Schedule',
    content:
      'The office staff desk will operate on standby shifts during upcoming regional festivals. Ensure all pending customer enquiries are reviewed and work orders are pre-scheduled 48 hours prior.',
    audience: 'OFFICE_STAFF',
    priority: 'NORMAL',
    author: 'Super Admin Operations',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
  {
    id: 'ann-3',
    title: 'New JCB Hydraulic Machinery Added to Central Depot',
    content:
      'Two new hydraulic earth excavation units have arrived at the Central Depot. Operators must complete the pre-dispatch equipment safety inspection checklist before site departure.',
    audience: 'ALL',
    priority: 'NORMAL',
    author: 'Fleet Management',
    createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
  },
];

export default function AdminAnnouncementsPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<'ALL' | 'OFFICE_STAFF' | 'WORKERS'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Announcement Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAudience, setNewAudience] = useState<'ALL' | 'OFFICE_STAFF' | 'WORKERS'>('ALL');
  const [newPriority, setNewPriority] = useState<'LOW' | 'NORMAL' | 'URGENT'>('NORMAL');

  useEffect(() => {
    if (!authLoading) {
      if (!token || user?.role !== 'SUPER_ADMIN') {
        router.push('/admin/login');
      } else {
        const saved = localStorage.getItem('kk_admin_announcements');
        if (saved) {
          try {
            setAnnouncements(JSON.parse(saved));
          } catch {
            setAnnouncements(DEFAULT_ANNOUNCEMENTS);
          }
        } else {
          setAnnouncements(DEFAULT_ANNOUNCEMENTS);
        }
      }
    }
  }, [authLoading, token, user, router]);

  const saveAnnouncements = (list: Announcement[]) => {
    setAnnouncements(list);
    localStorage.setItem('kk_admin_announcements', JSON.stringify(list));
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created: Announcement = {
      id: `ann-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      audience: newAudience,
      priority: newPriority,
      author: user?.name || user?.username || 'Super Admin',
      createdAt: new Date().toISOString(),
    };

    saveAnnouncements([created, ...announcements]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    const updated = announcements.filter((a) => a.id !== id);
    saveAnnouncements(updated);
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchAudience = audienceFilter === 'ALL' || a.audience === audienceFilter;
      const matchSearch =
        searchTerm === '' ||
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.content.toLowerCase().includes(searchTerm.toLowerCase());
      return matchAudience && matchSearch;
    });
  }, [announcements, audienceFilter, searchTerm]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-[#1A1C23] border border-gray-800 rounded-xl">
              <Megaphone className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Operational Announcements
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Broadcast operational notices, schedule changes, and safety guidelines to squads and office staff
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#7B4DFF] hover:bg-[#6A3DEE] px-4 py-2 rounded-xl text-sm font-medium text-white shadow-[0_0_15px_rgba(123,77,255,0.3)] transition-all ml-auto sm:ml-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#14151A] border border-gray-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D0E12] border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-700"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'WORKERS', 'OFFICE_STAFF'] as const).map((aud) => (
            <button
              key={aud}
              onClick={() => setAudienceFilter(aud)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                audienceFilter === aud
                  ? 'bg-[#1A1C23] text-white border border-gray-700'
                  : 'bg-[#0D0E12] text-gray-400 hover:text-white border border-gray-800'
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
          <div className="p-12 text-center text-gray-500 bg-[#14151A] rounded-xl border border-gray-800 text-xs">
            No announcements found matching this criteria.
          </div>
        ) : (
          filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-[#14151A] border border-gray-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        item.priority === 'URGENT'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : item.priority === 'NORMAL'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}
                    >
                      {item.priority}
                    </span>

                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                      Audience: {item.audience}
                    </span>

                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-600" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-gray-100">{item.title}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed bg-[#0D0E12] p-3.5 rounded-lg border border-gray-800/80">
                {item.content}
              </p>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span>Published by: {item.author}</span>
                <span>KK Group Regional Dispatch Network</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#14161D] rounded-2xl border border-gray-800 p-6 space-y-4 text-xs text-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-200">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-gray-100">Publish Announcement</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-300">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monsoon Safety Guidelines & Work Protocols"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full bg-[#0D0E12] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-gray-300">
                    Target Audience *
                  </label>
                  <select
                    value={newAudience}
                    onChange={(e: any) => setNewAudience(e.target.value)}
                    className="w-full bg-[#0D0E12] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-gray-500"
                  >
                    <option value="ALL">All Personnel</option>
                    <option value="WORKERS">Field Workers Only</option>
                    <option value="OFFICE_STAFF">Office Staff Only</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-300">
                    Priority Level *
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full bg-[#0D0E12] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-gray-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="URGENT">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-300">
                  Notice Details / Message *
                </label>
                <textarea
                  rows={4}
                  placeholder="Type announcement instructions, safety guidelines, or schedule details..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  className="w-full bg-[#0D0E12] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#7B4DFF] hover:bg-[#6A3DEE] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
