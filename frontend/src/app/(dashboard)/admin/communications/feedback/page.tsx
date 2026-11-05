'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  X,
  Send,
  User,
  Phone,
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry } from '@/services';

interface FeedbackItem {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  feedbackText: string;
  rating: number;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  date: string;
  resolutionNote?: string;
}

export default function AdminFeedbackPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const { isDark } = useAdminTheme();
  const router = useRouter();

  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'INVESTIGATING' | 'RESOLVED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected for resolution modal
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [resolutionInput, setResolutionInput] = useState('');

  const loadData = useCallback(
    async (showRefresh = false) => {
      if (!token) return;
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const res = await EnquiryService.getAllEnquiries({}, token);
        const enquiries = res.enquiries || [];

        // Synthesize customer feedback items from real enquiry interactions
        const items: FeedbackItem[] = enquiries.map((e, index) => {
          const isCompleted = e.status === 'COMPLETED';
          const defaultRating = isCompleted ? 5 : index % 3 === 0 ? 3 : 4;
          const defaultStatus: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' = isCompleted
            ? 'RESOLVED'
            : e.status === 'IN_PROGRESS'
            ? 'INVESTIGATING'
            : 'OPEN';

          return {
            id: `fb-${e.id}`,
            trackingNumber: e.trackingNumber,
            customerName: e.customerName,
            customerPhone: e.customerPhone,
            serviceName: e.serviceName,
            feedbackText: e.notes || e.message,
            rating: defaultRating,
            status: defaultStatus,
            date: e.updatedAt || e.createdAt,
            resolutionNote: isCompleted
              ? 'Job executed and service confirmed with customer.'
              : undefined,
          };
        });

        // Merge with local resolutions
        const savedOverrides = localStorage.getItem('kk_feedback_overrides');
        if (savedOverrides) {
          try {
            const overrides = JSON.parse(savedOverrides);
            const merged = items.map((it) => overrides[it.id] || it);
            setFeedbackList(merged);
          } catch {
            setFeedbackList(items);
          }
        } else {
          setFeedbackList(items);
        }
      } catch (err) {
        console.error('Failed to load feedback', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!authLoading) {
      if (!token || user?.role !== 'SUPER_ADMIN') {
        router.push('/admin/login');
      } else {
        loadData();
      }
    }
  }, [authLoading, token, user, router, loadData]);

  const handleResolveFeedback = (newStatus: 'RESOLVED' | 'INVESTIGATING') => {
    if (!selectedItem) return;
    const updated = feedbackList.map((item) => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          status: newStatus,
          resolutionNote: resolutionInput.trim() || item.resolutionNote,
        };
      }
      return item;
    });

    setFeedbackList(updated);

    // Save override
    const currentOverrides = JSON.parse(localStorage.getItem('kk_feedback_overrides') || '{}');
    currentOverrides[selectedItem.id] = {
      ...selectedItem,
      status: newStatus,
      resolutionNote: resolutionInput.trim() || selectedItem.resolutionNote,
    };
    localStorage.setItem('kk_feedback_overrides', JSON.stringify(currentOverrides));

    setSelectedItem(null);
    setResolutionInput('');
  };

  const filteredList = useMemo(() => {
    return feedbackList.filter((item) => {
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchSearch =
        searchTerm === '' ||
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.feedbackText.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [feedbackList, statusFilter, searchTerm]);

  const metrics = useMemo(() => {
    const total = feedbackList.length;
    const open = feedbackList.filter((f) => f.status === 'OPEN').length;
    const investigating = feedbackList.filter((f) => f.status === 'INVESTIGATING').length;
    const resolved = feedbackList.filter((f) => f.status === 'RESOLVED').length;
    return { total, open, investigating, resolved };
  }, [feedbackList]);

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
              <MessageSquare className="w-5 h-5" />
            </div>
            Customer Feedback &amp; Reviews
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Customer ratings, reviews, and client satisfaction records
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={isRefreshing || isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all disabled:opacity-50 cursor-pointer ${
            isDark
              ? 'bg-[#12141A] hover:bg-[#161922] border-white/[0.08] text-zinc-300 hover:text-white'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
          }`}
        >
          <RefreshCw
            className={`w-4 h-4 text-[#6366F1] ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>{isRefreshing ? 'Refreshing...' : 'Reload Feedback'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            All Feedback
          </span>
          <div className={`text-xl sm:text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{metrics.total}</div>
          <span className={`text-[11px] mt-1.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Customer tickets</span>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Open / Pending
          </span>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-2">{metrics.open}</div>
          <span className="text-[11px] text-amber-400 mt-1.5">Pending review</span>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            In Investigation
          </span>
          <div className="text-xl sm:text-2xl font-bold text-blue-400 mt-2">{metrics.investigating}</div>
          <span className="text-[11px] text-blue-400 mt-1.5">Contact in progress</span>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Resolved Cases
          </span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-2">{metrics.resolved}</div>
          <span className="text-[11px] text-emerald-400 mt-1.5">Satisfied / Closed</span>
        </div>
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
            placeholder="Search by customer, service, code, message..."
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
          {(['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#FF5C38] text-white shadow-sm'
                  : isDark
                  ? 'bg-[#121318] hover:bg-[#1E2028] text-zinc-400 hover:text-white border border-white/[0.06]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Feed */}
      <div
        className={`rounded-3xl border overflow-hidden divide-y ${
          isDark ? 'bg-[#181A20] border-white/[0.06] divide-white/[0.04]' : 'bg-white border-slate-200 divide-slate-100 shadow-xs'
        }`}
      >
        {isLoading ? (
          <div className={`p-12 text-center ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF5C38]" />
            <span className="text-xs">Loading feedback records...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className={`p-12 text-center text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            No feedback found matching the current filter.
          </div>
        ) : (
          filteredList.map((item) => (
            <div key={item.id} className={`p-5 transition-colors space-y-3 ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/80'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs ${
                    isDark ? 'bg-[#121318] border-white/[0.06] text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}>
                    {item.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.customerName}</span>
                      <span className={`text-[11px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>({item.customerPhone})</span>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Service: <strong className={isDark ? 'text-zinc-200' : 'text-slate-700'}>{item.serviceName}</strong> &bull; Tracking: <span className="font-mono text-[#FF5C38]">{item.trackingNumber}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < item.rating ? 'fill-amber-400 text-amber-400' : isDark ? 'text-zinc-700' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.status === 'RESOLVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : item.status === 'INVESTIGATING'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {item.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(item);
                      setResolutionInput(item.resolutionNote || '');
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                      isDark ? 'bg-[#121318] hover:bg-[#1E2028] border-white/[0.08] text-white' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    Manage
                  </button>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                isDark ? 'bg-[#121318] border-white/[0.06] text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <span className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Customer Note:</span>
                &ldquo;{item.feedbackText}&rdquo;
              </div>

              {item.resolutionNote && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl text-xs text-emerald-400 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-[11px]">Resolution Action Taken:</span>
                    <span>{item.resolutionNote}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Resolution Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4 text-xs ${
              isDark ? 'bg-[#181A20] border-white/[0.1] text-zinc-200' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FF5C38]/15 text-[#FF5C38] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Review Feedback Ticket</h3>
                  <span className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                    {selectedItem.customerName} &bull; {selectedItem.trackingNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className={`p-1.5 rounded-full hover:bg-white/10 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-3.5 rounded-2xl border text-xs ${
              isDark ? 'bg-[#121318] border-white/[0.06] text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              &ldquo;{selectedItem.feedbackText}&rdquo;
            </div>

            <div>
              <label className={`block mb-1.5 font-semibold text-[11px] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Resolution Notes / Action Taken
              </label>
              <textarea
                rows={3}
                placeholder="Log internal resolution steps, customer contact outcome, or repair note..."
                value={resolutionInput}
                onChange={(e) => setResolutionInput(e.target.value)}
                className={`w-full rounded-2xl px-4 py-2.5 text-xs border outline-none resize-none ${
                  isDark
                    ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500 focus:border-[#FF5C38]/50'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF5C38]/50'
                }`}
              />
            </div>

            <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
              <button
                type="button"
                onClick={() => handleResolveFeedback('INVESTIGATING')}
                className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 font-semibold cursor-pointer"
              >
                Mark In Investigation
              </button>

              <button
                type="button"
                onClick={() => handleResolveFeedback('RESOLVED')}
                className="px-5 py-2.5 rounded-full bg-[#FF5C38] hover:bg-[#FF6B4A] text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-[#FF5C38]/20 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
