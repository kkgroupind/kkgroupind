import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Calendar,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  DollarSign,
  Briefcase,
  Share2,
  MessageCircle,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  Check,
  CalendarRange,
} from 'lucide-react';
import { PeriodFilter } from './types';
import {
  filterAndCompileStatement,
  formatINR,
  downloadStatementPDF,
  buildWhatsAppStatementMessage,
  cleanPhoneNumber,
} from './statement-utils';
import { StatementDocument } from './StatementDocument';

interface CustomerStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
  currentUserName?: string;
}

export function CustomerStatementModal({
  isOpen,
  onClose,
  customer,
  currentUserName = 'Super Admin',
}: CustomerStatementModalProps) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('1_MONTH');
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [onlyCompleted, setOnlyCompleted] = useState(false);
  const [showTransactions, setShowTransactions] = useState(true);
  const [activeTab, setActiveTab] = useState<'configure' | 'preview'>('configure');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [whatsAppAlert, setWhatsAppAlert] = useState<string | null>(null);

  // Compute statement data reactively
  const statementData = useMemo(() => {
    if (!customer) return null;
    return filterAndCompileStatement(
      customer,
      periodFilter,
      customStartDate,
      customEndDate,
      onlyCompleted,
      showTransactions,
      currentUserName,
    );
  }, [
    customer,
    periodFilter,
    customStartDate,
    customEndDate,
    onlyCompleted,
    showTransactions,
    currentUserName,
  ]);

  if (!isOpen || !customer || !statementData) return null;

  // Handle PDF generation & download
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      await downloadStatementPDF(statementData);
    } catch (err) {
      console.error('Failed to generate statement PDF:', err);
      alert('Unable to generate PDF statement. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle WhatsApp transmission
  const handleShareWhatsApp = () => {
    const phone = cleanPhoneNumber(customer.phone || '');
    if (!phone) {
      setWhatsAppAlert('Customer phone number not available for direct WhatsApp sharing.');
      setTimeout(() => setWhatsAppAlert(null), 4000);
      return;
    }

    const message = buildWhatsAppStatementMessage(statementData);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#14151A] border border-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-gray-800/80 flex items-center justify-between bg-[#14151A] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2A835F] to-emerald-400 p-[1px] shadow-lg shadow-[#2A835F]/20">
              <div className="w-full h-full bg-[#14151A] rounded-[15px] flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-100">
                  Customer Statement Generator
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#2A835F]/20 border border-[#2A835F]/40 text-emerald-300 font-semibold hidden sm:inline-block">
                  Verified PDF Engine
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {customer.name || customer.username}{' '}
                <span className="text-gray-500 font-mono">(@{customer.username})</span> • Comprehensive Work & Financial Statement
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white bg-gray-900/60 hover:bg-gray-800 border border-gray-800 transition-all cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls Bar */}
        <div className="px-5 sm:px-8 py-2.5 bg-[#181A20] border-b border-gray-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Dual Pill Switcher */}
          <div className="flex items-center bg-[#101115] p-1 rounded-xl border border-gray-800">
            <button
              type="button"
              onClick={() => setActiveTab('configure')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'configure'
                  ? 'bg-[#2A835F] text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter & Configure</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-[#2A835F] text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Statement Preview & PDF</span>
            </button>
          </div>

          {/* Quick period indicator badge */}
          <div className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-300 font-semibold">{statementData.periodLabel}</span>
          </div>
        </div>

        {/* WhatsApp Alert notification */}
        {whatsAppAlert && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <span>{whatsAppAlert}</span>
            <button
              type="button"
              onClick={() => setWhatsAppAlert(null)}
              className="text-amber-300/80 hover:text-amber-200 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {activeTab === 'configure' ? (
            <div className="space-y-6">
              {/* Period Selector Card */}
              <div className="p-5 rounded-2xl bg-[#181A20] border border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-200">
                    <CalendarRange className="w-4 h-4 text-emerald-400" />
                    <span>Select Statement Period / സമയപരിധി</span>
                  </div>
                  <span className="text-xs text-gray-500">Filters all works and transactions</span>
                </div>

                {/* Period Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {(
                    [
                      { id: '1_MONTH', label: 'Last 1 Month', desc: 'Past 30 Days' },
                      { id: '3_MONTHS', label: 'Last 3 Months', desc: 'Quarterly' },
                      { id: '1_YEAR', label: 'Last 1 Year', desc: 'Annual Ledger' },
                      { id: 'CUSTOM', label: 'Custom Range', desc: 'Specific Dates' },
                      { id: 'ALL', label: 'All Time', desc: 'Lifetime History' },
                    ] as const
                  ).map((p) => {
                    const isSelected = periodFilter === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPeriodFilter(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2A835F]/20 border-[#2A835F] text-white shadow-md'
                            : 'bg-[#101115] border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? 'text-emerald-300' : 'text-gray-300'
                            }`}
                          >
                            {p.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-[10px] text-gray-500">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Date Range Pickers (shown when 'CUSTOM' is selected) */}
                {periodFilter === 'CUSTOM' && (
                  <div className="pt-3 border-t border-gray-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                        Start Date (From)
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full bg-[#101115] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 focus:outline-hidden focus:border-[#2A835F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                        End Date (To)
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full bg-[#101115] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 focus:outline-hidden focus:border-[#2A835F]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Toggles */}
              <div className="p-5 rounded-2xl bg-[#181A20] border border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-gray-800/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={onlyCompleted}
                    onChange={(e) => setOnlyCompleted(e.target.checked)}
                    className="mt-0.5 rounded-md border-gray-700 bg-gray-900 text-[#2A835F] focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-200 block">
                      Include Only Completed Works
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      Hide pending or in-progress service requests from the final statement
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-gray-800/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={showTransactions}
                    onChange={(e) => setShowTransactions(e.target.checked)}
                    className="mt-0.5 rounded-md border-gray-700 bg-gray-900 text-[#2A835F] focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-200 block">
                      Include Payment Transactions Ledger
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      Display verified UPI / Cash transaction records and references
                    </span>
                  </div>
                </label>
              </div>

              {/* Dynamic Live Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#181A20] border border-gray-800">
                  <div className="text-[10px] uppercase font-bold text-gray-500">Matching Bookings</div>
                  <div className="text-2xl font-black text-gray-100 mt-1">
                    {statementData.stats.totalEnquiries}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                    {statementData.stats.completedWorks} Completed
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#181A20] border border-gray-800">
                  <div className="text-[10px] uppercase font-bold text-gray-500">Active / In Pipeline</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {statementData.stats.inProgressWorks + statementData.stats.pendingWorks}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">In Progress or Pending</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#181A20] border border-gray-800">
                  <div className="text-[10px] uppercase font-bold text-gray-500">Total Billed Value</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    {formatINR(statementData.stats.totalBilledAmount)}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">For Selected Period</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#181A20] border border-gray-800">
                  <div className="text-[10px] uppercase font-bold text-gray-500">Settled Amount</div>
                  <div className="text-2xl font-black text-blue-400 font-mono mt-1">
                    {formatINR(statementData.stats.totalPaidAmount)}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {statementData.stats.outstandingBalance > 0
                      ? `Pending: ${formatINR(statementData.stats.outstandingBalance)}`
                      : 'Fully Settled (0 Bal)'}
                  </div>
                </div>
              </div>

              {/* Records preview preview list */}
              <div className="p-5 rounded-2xl bg-[#181A20] border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Works in this statement ({statementData.enquiries.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Document Preview</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {statementData.enquiries.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-500">
                    No enquiries or completed works found in this date window. Try changing the period filter above.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800/60 max-h-60 overflow-y-auto pr-1">
                    {statementData.enquiries.map((enq) => (
                      <div key={enq.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-3">
                          <div className="font-bold text-gray-200 truncate">{enq.serviceName}</div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-gray-400">{enq.trackingNumber}</span>
                            <span>•</span>
                            <span>{enq.date}</span>
                            {enq.workerName && (
                              <>
                                <span>•</span>
                                <span className="text-gray-400">Squad: {enq.workerName}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-emerald-400 font-mono">
                            {formatINR(enq.amount)}
                          </div>
                          <span
                            className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              enq.status === 'COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {enq.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Statement Preview Tab */
            <div className="bg-[#0b0c0e] p-3 sm:p-6 rounded-2xl border border-gray-800/80 flex justify-center overflow-x-auto">
              <StatementDocument data={statementData} />
            </div>
          )}
        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 border-t border-gray-800 bg-[#14151A] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2A835F]" />
            <span className="hidden sm:inline">Official Kerala Operations Statement PDF</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Send Summary via WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Share on WhatsApp</span>
            </button>

            {/* Download Statement PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2A835F] to-emerald-600 hover:from-[#236D4F] hover:to-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span>{isGeneratingPdf ? 'Preparing PDF...' : 'Download Statement PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
