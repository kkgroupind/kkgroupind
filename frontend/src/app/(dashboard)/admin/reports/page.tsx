'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { FinanceService, FinancialTransaction } from '@/services';
import { FileSpreadsheet, FileText, Download, Activity, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

export default function AdminReportsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportMonth, setReportMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

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
    <div className="min-h-screen bg-[#0D0E12] text-gray-200 p-6 lg:p-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 mb-8 border border-gray-800 bg-[#14151A] shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#2A835F]/20 to-transparent pointer-events-none rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-[#2A835F]" />
              Reports &amp; Analytics Export
            </h1>
            <p className="text-gray-400 mt-2 text-sm max-w-2xl">
              Generate comprehensive financial reports, export to Excel (CSV), or print as PDF documents. Data is pulled directly from the Operations Command Center.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-[#0D0E12] border border-gray-800 p-2 rounded-2xl">
            <CalendarIcon className="w-5 h-5 text-gray-400 ml-2" />
            <input 
              type="month" 
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none focus:ring-0 px-2"
            />
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:hidden">
        <div className="p-6 rounded-3xl bg-[#14151A] border border-gray-800 shadow-lg flex flex-col items-center justify-center text-center gap-4 group hover:border-[#2A835F]/50 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Excel / CSV Report</h3>
            <p className="text-xs text-gray-400 mt-1">Download raw financial tabular data</p>
          </div>
          <button 
            onClick={downloadCSV}
            disabled={loading || transactions.length === 0}
            className="mt-2 px-6 py-2.5 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold text-sm flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download Excel
          </button>
        </div>

        <div className="p-6 rounded-3xl bg-[#14151A] border border-gray-800 shadow-lg flex flex-col items-center justify-center text-center gap-4 group hover:border-purple-500/50 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">PDF Document Report</h3>
            <p className="text-xs text-gray-400 mt-1">Print formatted summary report</p>
          </div>
          <button 
            onClick={handlePrintPDF}
            disabled={loading || transactions.length === 0}
            className="mt-2 px-6 py-2.5 rounded-xl bg-[#7B4DFF] hover:bg-[#6840d8] text-white font-bold text-sm flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            Print to PDF
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-[#14151A] rounded-3xl border border-gray-800 p-6 shadow-xl print:shadow-none print:border-none print:p-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Data Preview ({transactions.length} records)
          </h2>
          {loading && <span className="text-xs text-gray-400 animate-pulse">Loading data...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-3">Date</th>
                <th className="p-3">Txn #</th>
                <th className="p-3">Type</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Method</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                    No transactions found for {reportMonth}
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 15).map(t => (
                  <tr key={t.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-gray-300">{t.dateString}</td>
                    <td className="p-3 font-mono text-xs text-[#7B4DFF]">{t.transactionNumber}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 text-xs">{t.category}</td>
                    <td className={`p-3 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₹{t.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-gray-400 text-xs">{t.paymentMethod}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {transactions.length > 15 && (
            <div className="p-4 text-center text-xs text-gray-500 italic print:hidden">
              Showing 15 out of {transactions.length} records. Export to view all.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
