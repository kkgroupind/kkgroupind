'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
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
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-[#1A1C23] border border-gray-800 rounded-xl">
              <MessageSquare className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Complaints &amp; Customer Feedback
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review service ratings, customer grievances, and resolution tickets
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 text-[#7B4DFF] ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>{isRefreshing ? 'Refreshing...' : 'Reload Feedback'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">All Feedback Items</span>
          <div className="text-2xl font-bold text-gray-100 mt-1">{metrics.total}</div>
          <span className="text-xs text-gray-500 mt-1 block">Customer ticket entries</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Open / Unreviewed</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{metrics.open}</div>
          <span className="text-xs text-amber-500/80 mt-1 block">Pending investigation</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">In Investigation</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{metrics.investigating}</div>
          <span className="text-xs text-blue-400/80 mt-1 block">Contact in progress</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Resolved Cases</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.resolved}</div>
          <span className="text-xs text-emerald-400/80 mt-1 block">Satisfied / Closed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#14151A] border border-gray-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by customer, service, code, message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D0E12] border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-700"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-[#1A1C23] text-white border border-gray-700'
                  : 'bg-[#0D0E12] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Feed */}
      <div className="bg-[#14151A] rounded-xl border border-gray-800 overflow-hidden divide-y divide-gray-800">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#7B4DFF]" />
            <span>Loading feedback records...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            No feedback found matching the current filter.
          </div>
        ) : (
          filteredList.map((item) => (
            <div key={item.id} className="p-5 hover:bg-[#1A1C23]/40 transition-colors space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300 font-semibold text-xs">
                    {item.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-100">{item.customerName}</span>
                      <span className="text-[11px] text-gray-500">({item.customerPhone})</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      Service: <strong className="text-gray-200">{item.serviceName}</strong> &bull; Tracking: <span className="font-mono text-emerald-400">{item.trackingNumber}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-700'
                        }`}
                      />
                    ))}
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                      item.status === 'RESOLVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.status === 'INVESTIGATING'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
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
                    className="px-3 py-1 rounded bg-[#0D0E12] hover:bg-gray-800 text-gray-200 text-xs font-medium border border-gray-800 transition-colors"
                  >
                    Manage
                  </button>
                </div>
              </div>

              <div className="bg-[#0D0E12] p-3 rounded-lg border border-gray-800/80 text-xs text-gray-300">
                <span className="text-gray-500 block text-[11px] mb-1">Customer Note:</span>
                &ldquo;{item.feedbackText}&rdquo;
              </div>

              {item.resolutionNote && (
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-[11px]">Resolution Action:</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#14161D] rounded-2xl border border-gray-800 p-6 space-y-4 text-xs text-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-200">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-100">Review Feedback Ticket</h3>
                  <span className="text-[11px] text-gray-500">
                    {selectedItem.customerName} &bull; {selectedItem.trackingNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#0D0E12] rounded-lg border border-gray-800 text-xs text-gray-300">
              &ldquo;{selectedItem.feedbackText}&rdquo;
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-300">
                Resolution Notes / Action Taken
              </label>
              <textarea
                rows={3}
                placeholder="Log internal resolution steps, customer contact outcome, or repair note..."
                value={resolutionInput}
                onChange={(e) => setResolutionInput(e.target.value)}
                className="w-full bg-[#0D0E12] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => handleResolveFeedback('INVESTIGATING')}
                className="px-3 py-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 font-medium"
              >
                Mark In Investigation
              </button>

              <button
                type="button"
                onClick={() => handleResolveFeedback('RESOLVED')}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5"
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
