'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
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
  const { isDark } = useAdminTheme();
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
    let monthIdx = parseInt(selectedMonthVal, 10) - 1;
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
    let monthIdx = parseInt(selectedMonthVal, 10) - 1;
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
    
    let csvContent = 'Date,Txn Number,Type,Category,Amount,Payment Method,Status,Notes\n';
    
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
    <div className={`space-y-6 max-w-[1400px] mx-auto pb-10 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
      {/* Header Banner */}
      <div
        className={`p-6 sm:p-8 rounded-[28px] border relative overflow-hidden transition-all ${
          isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <div
                className={`p-2.5 rounded-[24px] border flex items-center justify-center ${
                  isDark ? 'bg-[#161922] border-white/[0.06] text-[#6366F1]' : 'bg-slate-50 border-slate-200 text-[#6366F1]'
                }`}
              >
                <Activity className="w-5 h-5" />
              </div>
              Business &amp; Finance Reports
            </h1>
            <p className={`mt-1.5 text-xs sm:text-sm max-w-2xl ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Monthly reports of completed jobs, income, and worker wages. Download easy Excel spreadsheets with one click.
            </p>
          </div>

          {/* Calendar Month Picker */}
          <div className="relative shrink-0" ref={calendarRef}>
            <div className={`flex items-center gap-1.5 p-1 rounded-full border ${isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <button
                type="button"
                onClick={handlePrevMonth}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isDark ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-[#FF5C38]" />
                <span className="whitespace-nowrap">{displayLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCalendarOpen ? 'rotate-180 text-[#FF5C38]' : isDark ? 'text-zinc-400' : 'text-slate-400'}`} />
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isDark ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Month-Year Calendar Popover */}
            {isCalendarOpen && (
              <div
                className={`absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-3xl border shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl ${
                  isDark ? 'bg-[#181A20] border-white/[0.1]' : 'bg-white border-slate-200'
                }`}
              >
                <div className={`flex items-center justify-between mb-3 pb-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  <button
                    type="button"
                    onClick={() => setViewYear(y => y - 1)}
                    className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/5"
                    title="Previous Year"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{viewYear}</span>
                  <button
                    type="button"
                    onClick={() => setViewYear(y => y + 1)}
                    className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/5"
                    title="Next Year"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {MONTH_NAMES.map((m) => {
                    const isSelected = selectedYear === viewYear && selectedMonthVal === m.val;
                    return (
                      <button
                        key={m.val}
                        type="button"
                        onClick={() => selectMonth(m.val)}
                        className={`py-2 px-2.5 rounded-2xl text-xs font-semibold transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#FF5C38] text-white shadow-md font-bold'
                            : isDark
                            ? 'bg-[#121318] border border-white/[0.04] text-zinc-300 hover:text-white hover:bg-[#1E2028]'
                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{m.short}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
        {/* Excel / CSV Box */}
        <div
          className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center gap-3 transition-all ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Excel / CSV</h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Download raw financial tabular data</p>
          </div>
          <button 
            onClick={downloadCSV}
            disabled={loading || transactions.length === 0}
            className="w-full max-w-xs px-5 py-2.5 rounded-full bg-[#FF5C38] hover:bg-[#FF6B4A] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF5C38]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Download Excel</span>
          </button>
        </div>

        {/* PDF Box */}
        <div
          className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center gap-3 transition-all ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${isDark ? 'bg-[#121318] border-white/[0.06] text-[#FF5C38]' : 'bg-slate-50 border-slate-200 text-[#FF5C38]'}`}>
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>PDF Document</h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Print formatted summary report</p>
          </div>
          <button 
            onClick={handlePrintPDF}
            disabled={loading || transactions.length === 0}
            className={`w-full max-w-xs px-5 py-2.5 rounded-full border font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              isDark
                ? 'bg-[#121318] hover:bg-[#1E2028] border-white/[0.08] text-white'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div
        className={`rounded-3xl border p-5 sm:p-6 shadow-sm print:shadow-none print:border-none print:p-0 ${
          isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Data Preview ({transactions.length} records)
          </h2>
          {loading && <span className={`text-xs animate-pulse ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Loading data...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'border-white/[0.06] text-zinc-400' : 'border-slate-100 text-slate-500'}`}>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Txn #</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Method</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-slate-100'}`}>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`p-8 text-center italic ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                    No transactions found for {displayLabel}
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 15).map(t => (
                  <tr key={t.id} className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-3 whitespace-nowrap font-mono">{t.dateString}</td>
                    <td className="py-3 px-3 font-mono text-[11px] font-semibold text-[#FF5C38] whitespace-nowrap">{t.transactionNumber}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">{t.category}</td>
                    <td className={`py-3 px-3 text-right font-bold whitespace-nowrap ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₹{t.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-mono">{t.paymentMethod}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {transactions.length > 15 && (
            <div className={`p-3 text-center text-xs italic print:hidden ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              Showing 15 out of {transactions.length} records. Export to view all.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
