'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { FinanceService, FinancialTransaction } from '@/services';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Activity, 
  Calendar as CalendarIcon, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const MONTH_NAMES = [
  { short: 'Jan', full: 'January', val: '01' },
  { short: 'Feb', full: 'February', val: '02' },
  { short: 'Mar', full: 'March', val: '03' },
  { short: 'Apr', full: 'April', val: '04' },
  { short: 'May', full: 'May', val: '05' },
  { short: 'Jun', full: 'June', val: '06' },
  { short: 'Jul', full: 'July', val: '07' },
  { short: 'Aug', full: 'August', val: '08' },
  { short: 'Sep', full: 'September', val: '09' },
  { short: 'Oct', full: 'October', val: '10' },
  { short: 'Nov', full: 'November', val: '11' },
  { short: 'Dec', full: 'December', val: '12' },
];

export default function AdminReportsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportMonth, setReportMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  // Month Calendar Dropdown State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const selectedYear = parseInt(reportMonth.slice(0, 4), 10) || new Date().getFullYear();
  const selectedMonthVal = reportMonth.slice(5, 7) || '01';
  const [viewYear, setViewYear] = useState(selectedYear);

  // Sync view year when reportMonth changes externally
  useEffect(() => {
    setViewYear(selectedYear);
  }, [selectedYear]);

  // Click outside to close calendar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  const handlePrevMonth = () => {
    let year = selectedYear;
    let monthIdx = parseInt(selectedMonthVal, 10) - 1; // 0-based
    if (monthIdx === 0) {
      monthIdx = 11;
      year -= 1;
    } else {
      monthIdx -= 1;
    }
    const mm = String(monthIdx + 1).padStart(2, '0');
    setReportMonth(`${year}-${mm}`);
  };

  const handleNextMonth = () => {
    let year = selectedYear;
    let monthIdx = parseInt(selectedMonthVal, 10) - 1; // 0-based
    if (monthIdx === 11) {
      monthIdx = 0;
      year += 1;
    } else {
      monthIdx += 1;
    }
    const mm = String(monthIdx + 1).padStart(2, '0');
    setReportMonth(`${year}-${mm}`);
  };

  const selectMonth = (val: string) => {
    setReportMonth(`${viewYear}-${val}`);
    setIsCalendarOpen(false);
  };

  const currentMonthObj = MONTH_NAMES.find(m => m.val === selectedMonthVal) || MONTH_NAMES[0];
  const displayLabel = `${currentMonthObj.full} ${selectedYear}`;

  const fetchTransactions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await FinanceService.getTransactions(token, { month: reportMonth, limit: 1000 });
      setTransactions(res.items || []);
    } catch (err) {
      console.error('Error fetching transactions for report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token, reportMonth]);

  const downloadCSV = () => {
    if (transactions.length === 0) return alert('No data to export');
    
    // Create CSV headers
    let csvContent = 'Date,Txn Number,Type,Category,Amount,Payment Method,Status,Notes\n';
    
    // Add rows
    transactions.forEach(t => {
      const safeNotes = (t.notes || '').replace(/,/g, ';').replace(/\n/g, ' ');
      csvContent += `${t.dateString},${t.transactionNumber},${t.type},${t.category},${t.amount},${t.paymentMethod},${t.status},${safeNotes}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KK_Group_Finance_Report_${reportMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0D0E12] text-gray-200 p-3 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-4 sm:mb-8 border border-gray-800 bg-[#14151A] shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#2A835F]/20 to-transparent pointer-events-none rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-white flex items-center gap-2 sm:gap-3">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-[#2A835F]" />
              Reports &amp; Analytics Export
            </h1>
            <p className="text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm max-w-2xl">
              Generate comprehensive financial reports, export to Excel (CSV), or print as PDF documents. Data is pulled directly from the Operations Command Center.
            </p>
          </div>

          {/* Premium Calendar Month Picker */}
          <div className="relative shrink-0" ref={calendarRef}>
            <div className="flex items-center gap-1 sm:gap-2 bg-[#0D0E12] border border-gray-800 hover:border-gray-700 p-1 sm:p-1.5 rounded-2xl shadow-inner transition-colors">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800/80 text-white font-semibold text-xs sm:text-sm active:scale-95 transition-all"
              >
                <CalendarIcon className="w-4 h-4 text-[#2A835F]" />
                <span className="whitespace-nowrap">{displayLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isCalendarOpen ? 'rotate-180 text-[#2A835F]' : ''}`} />
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Month-Year Calendar Popover */}
            {isCalendarOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#14151A] border border-gray-800/90 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                {/* Year Controller */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-800">
                  <button
                    type="button"
                    onClick={() => setViewYear(y => y - 1)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
                    title="Previous Year"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-white tracking-wide">{viewYear}</span>
                  <button
                    type="button"
                    onClick={() => setViewYear(y => y + 1)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
                    title="Next Year"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 12 Months Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {MONTH_NAMES.map((m) => {
                    const isSelected = selectedYear === viewYear && selectedMonthVal === m.val;
                    const now = new Date();
                    const isCurrentCalMonth = now.getFullYear() === viewYear && String(now.getMonth() + 1).padStart(2, '0') === m.val;

                    return (
                      <button
                        key={m.val}
                        type="button"
                        onClick={() => selectMonth(m.val)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all relative flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-[#2A835F] text-white shadow-lg shadow-[#2A835F]/20 font-bold'
                            : 'bg-[#0D0E12] border border-gray-800/70 text-gray-300 hover:text-white hover:border-gray-700 hover:bg-[#1A1C23]'
                        }`}
                      >
                        <span>{m.short}</span>
                        {isCurrentCalMonth && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-[#2A835F] mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Shortcuts */}
                <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const y = now.getFullYear();
                      const mm = String(now.getMonth() + 1).padStart(2, '0');
                      setViewYear(y);
                      setReportMonth(`${y}-${mm}`);
                      setIsCalendarOpen(false);
                    }}
                    className="text-[11px] font-semibold text-[#2A835F] hover:text-[#38a97b] transition-colors"
                  >
                    Jump to Current Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(false)}
                    className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Options: Single row on mobile (grid-cols-2) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8 print:hidden">
        {/* Excel / CSV Box */}
        <div className="p-3 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#14151A] border border-gray-800 shadow-lg flex flex-col items-center justify-center text-center gap-2 sm:gap-4 group hover:border-[#2A835F]/50 transition-colors">
          <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <FileSpreadsheet className="w-5 h-5 sm:w-8 sm:h-8" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-lg font-bold text-white truncate">Excel / CSV</h3>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 hidden sm:block">Download raw financial tabular data</p>
          </div>
          <button 
            onClick={downloadCSV}
            disabled={loading || transactions.length === 0}
            className="w-full mt-1 sm:mt-2 px-2.5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold text-[11px] sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Download Excel</span>
          </button>
        </div>

        {/* PDF Box */}
        <div className="p-3 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#14151A] border border-gray-800 shadow-lg flex flex-col items-center justify-center text-center gap-2 sm:gap-4 group hover:border-purple-500/50 transition-colors">
          <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <FileText className="w-5 h-5 sm:w-8 sm:h-8" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-lg font-bold text-white truncate">PDF Report</h3>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 hidden sm:block">Print formatted summary report</p>
          </div>
          <button 
            onClick={handlePrintPDF}
            disabled={loading || transactions.length === 0}
            className="w-full mt-1 sm:mt-2 px-2.5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-[#7B4DFF] hover:bg-[#6840d8] text-white font-bold text-[11px] sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Print PDF</span>
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-[#14151A] rounded-2xl sm:rounded-3xl border border-gray-800 p-3 sm:p-6 shadow-xl print:shadow-none print:border-none print:p-0">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            Data Preview ({transactions.length} records)
          </h2>
          {loading && <span className="text-xs text-gray-400 animate-pulse">Loading data...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-2 sm:p-3">Date</th>
                <th className="p-2 sm:p-3">Txn #</th>
                <th className="p-2 sm:p-3">Type</th>
                <th className="p-2 sm:p-3">Category</th>
                <th className="p-2 sm:p-3 text-right">Amount</th>
                <th className="p-2 sm:p-3">Method</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                    No transactions found for {displayLabel}
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 15).map(t => (
                  <tr key={t.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                    <td className="p-2 sm:p-3 text-gray-300 whitespace-nowrap">{t.dateString}</td>
                    <td className="p-2 sm:p-3 font-mono text-[10px] sm:text-xs text-[#7B4DFF] whitespace-nowrap">{t.transactionNumber}</td>
                    <td className="p-2 sm:p-3">
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 text-gray-400 text-[11px] sm:text-xs whitespace-nowrap">{t.category}</td>
                    <td className={`p-2 sm:p-3 text-right font-bold whitespace-nowrap ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₹{t.amount.toLocaleString()}
                    </td>
                    <td className="p-2 sm:p-3 text-gray-400 text-[11px] sm:text-xs whitespace-nowrap">{t.paymentMethod}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {transactions.length > 15 && (
            <div className="p-3 sm:p-4 text-center text-xs text-gray-500 italic print:hidden">
              Showing 15 out of {transactions.length} records. Export to view all.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
