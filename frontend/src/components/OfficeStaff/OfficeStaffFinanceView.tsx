'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import {
  FinanceService,
  FinancialTransaction,
  FinancialSummary,
  ServiceEnquiry,
  WorkerWithAvailability,
  User,
  TransactionCategory,
  PaymentMethod,
  CreateTransactionPayload,
} from '@/services';
import {
  IndianRupee,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
  Banknote,
  CreditCard,
  FileText,
  Fuel,
  Coffee,
  ShoppingBag,
  RefreshCw,
  Search,
  X,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface OfficeStaffFinanceViewProps {
  enquiries: ServiceEnquiry[];
  workers: (WorkerWithAvailability | User)[];
  onRefreshParent?: () => void;
}


export function OfficeStaffFinanceView({
  enquiries,
  workers,
}: OfficeStaffFinanceViewProps) {
  const { token, user } = useAuth();

  const [todayDateStr, setTodayDateStr] = useState<string>('2026-09-26');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-26');
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>('2026-09-26');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [category, setCategory] = useState<TransactionCategory>('SERVICE_PAYMENT');
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [vendorName, setVendorName] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [workerId, setWorkerId] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadFinanceData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [sum, txns] = await Promise.all([
        FinanceService.getSummary(token),
        FinanceService.getTransactions(token, { limit: 100 }),
      ]);
      setSummary(sum);
      if (sum.todayDate) {
        setTodayDateStr(sum.todayDate);
      }
      setTransactions(txns.items);
    } catch (err) {
      console.error('Failed to load office staff finances:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  // Filter transactions for the selected day
  const displayedTransactions = useMemo(() => {
    return transactions.filter((t) => t.dateString === selectedDate);
  }, [transactions, selectedDate]);

  // Today totals
  const dayStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    displayedTransactions.forEach((t) => {
      if (t.type === 'INCOME') income += Number(t.amount);
      else expense += Number(t.amount);
    });
    return {
      income,
      expense,
      net: income - expense,
      pendingCount: displayedTransactions.filter((t) => t.status === 'PENDING').length,
    };
  }, [displayedTransactions]);

  const openIncomeModal = () => {
    setEntryMode('INCOME');
    setCategory('SERVICE_PAYMENT');
    setAmount(0);
    setDate(selectedDate || todayDateStr);
    setPaymentMethod('UPI');
    setSelectedEnquiryId('');
    setCustomerName('');
    setVendorName('');
    setReferenceNumber('');
    setNotes('');
    setFormError(null);
    setIsEntryModalOpen(true);
  };

  const openExpenseModal = () => {
    setEntryMode('EXPENSE');
    setCategory('FUEL_DIESEL');
    setAmount(0);
    setDate(selectedDate || todayDateStr);
    setPaymentMethod('CASH');
    setSelectedEnquiryId('');
    setCustomerName('');
    setVendorName('');
    setReferenceNumber('');
    setNotes('');
    setWorkerId('');
    setFormError(null);
    setIsEntryModalOpen(true);
  };

  const handleEnquirySelect = (eId: string) => {
    setSelectedEnquiryId(eId);
    const enq = enquiries.find((e) => e.id === eId);
    if (enq) {
      setCustomerName(`${enq.customerName} (${enq.district || 'Kerala'})`);
      setNotes(`Payment for ${enq.serviceName} - Ticket #${enq.trackingNumber}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setFormError('Please enter a valid amount greater than ₹0.');
      return;
    }
    setSubmitting(true);
    setFormError(null);

    try {
      const payload: CreateTransactionPayload = {
        type: entryMode,
        category,
        amount,
        date,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        customerName: entryMode === 'INCOME' ? customerName.trim() : undefined,
        vendorName: entryMode === 'EXPENSE' ? vendorName.trim() : undefined,
        notes: notes.trim() || undefined,
        enquiryId: selectedEnquiryId || undefined,
        workerId: workerId || undefined,
      };

      await FinanceService.createTransaction(token, payload);
      showToast(
        entryMode === 'INCOME'
          ? 'Payment collection submitted for Super Admin sign-off'
          : 'Expense voucher logged successfully',
      );
      setIsEntryModalOpen(false);
      loadFinanceData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#2A835F] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#14161D] border border-gray-800 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-[#2A835F] uppercase tracking-wider bg-[#2A835F]/10 px-2.5 py-0.5 rounded-full border border-[#2A835F]/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Office Desk Register
              </span>
              <span className="text-xs text-gray-500">Daily Cashbook</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-100 flex items-center gap-2">
              <span>Finance & Collections</span>
              <span className="text-sm font-semibold text-gray-400 hidden sm:inline">
                (വരവ് ചെലവ് കണക്കുകൾ)
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Record customer advances, milestone collections, JCB diesel receipts, and worker site allowances. All vouchers are securely queued for Super Admin verification.
            </p>
          </div>

          <button
            onClick={() => loadFinanceData()}
            disabled={isLoading}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#2A835F]' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Primary Action Buttons (Large, Friendly, Foolproof) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Record Payment Button */}
        <div
          onClick={openIncomeModal}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#14161D] to-[#14161D] border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-[#2A835F] flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowDownLeft className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              വരുമാനം • Inflow
            </span>
          </div>
          <h3 className="text-base font-bold text-gray-100 group-hover:text-emerald-400 transition-colors">
            + Record Payment Received
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Customer advance, JCB meter payment, or work order balance settlement.
          </p>
        </div>

        {/* Record Expense Button */}
        <div
          onClick={openExpenseModal}
          className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/30 via-[#14161D] to-[#14161D] border border-rose-500/30 hover:border-rose-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              ചെലവ് • Outflow
            </span>
          </div>
          <h3 className="text-base font-bold text-gray-100 group-hover:text-rose-400 transition-colors">
            + Record Daily Expense
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Site diesel fuel, worker lunch/tea bata, emergency materials, or office petty cash.
          </p>
        </div>

      </div>

      {/* Date Selector & Daily Ledger Card */}
      <div className="rounded-2xl bg-[#14161D] border border-gray-800 p-5 sm:p-6 space-y-6">
        
        {/* Date Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2A835F]" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Active Register Date:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-200 focus:outline-none focus:border-[#2A835F]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(todayDateStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedDate === todayDateStr
                  ? 'bg-[#2A835F] text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                const str = d.toISOString().split('T')[0];
                setSelectedDate(str);
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-bold transition-colors"
            >
              Previous Day
            </button>
          </div>
        </div>

        {/* Day Metrics Mini Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Day Collections</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              ₹{dayStats.income.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Day Expenses</span>
            <div className="text-xl font-bold text-rose-400 mt-1">
              ₹{dayStats.expense.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Net Day Balance</span>
            <div className={`text-xl font-bold mt-1 ${dayStats.net >= 0 ? 'text-[#2A835F]' : 'text-rose-400'}`}>
              ₹{dayStats.net.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Day Transactions List */}
        <div>
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-gray-400 uppercase">
            <span>Vouchers for {selectedDate} ({displayedTransactions.length})</span>
            <span>Status</span>
          </div>

          {displayedTransactions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-gray-800 rounded-xl text-gray-500 text-xs">
              No entries logged for {selectedDate}. Use the buttons above to log payments or site expenses.
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedTransactions.map((t) => {
                const isInc = t.type === 'INCOME';
                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-gray-900/40 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isInc ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isInc ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#2A835F]">
                            {t.transactionNumber}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            • {t.paymentMethod}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-gray-200 mt-0.5">
                          {t.customerName || t.vendorName || t.category.replace(/_/g, ' ')}
                        </div>

                        {t.notes && (
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {t.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-right">
                        <div className={`font-black text-sm sm:text-base ${
                          isInc ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {isInc ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {t.category.replace(/_/g, ' ')}
                        </div>
                      </div>

                      {t.status === 'VERIFIED' ? (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending Admin
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* CREATE ENTRY MODAL */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#14161D] border border-gray-800 p-6 shadow-2xl text-gray-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-800 mb-5">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#2A835F]" />
                <h3 className="text-base font-bold text-gray-100">
                  {entryMode === 'INCOME' ? 'Record Customer Collection' : 'Record Daily Site Expense'}
                </h3>
              </div>
              <button
                onClick={() => setIsEntryModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                    Amount (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="0.00"
                      value={amount || ''}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-gray-900 border border-gray-700 font-bold text-sm text-gray-100 focus:outline-none focus:border-[#2A835F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 font-medium text-gray-200 focus:outline-none focus:border-[#2A835F]"
                  />
                </div>
              </div>

              {/* Payment Method & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                    Received / Paid via *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 font-medium text-gray-200 focus:outline-none focus:border-[#2A835F]"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="CASH">Cash on Site / Hand</option>
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT)</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 font-medium text-gray-200 focus:outline-none focus:border-[#2A835F]"
                  >
                    {entryMode === 'INCOME' ? (
                      <>
                        <option value="SERVICE_PAYMENT">Service Payment</option>
                        <option value="ADVANCE_PAYMENT">Advance Deposit</option>
                        <option value="MILESTONE_PAYMENT">Milestone Payment</option>
                        <option value="FINAL_SETTLEMENT">Final Settlement</option>
                        <option value="OTHER">Other Income</option>
                      </>
                    ) : (
                      <>
                        <option value="FUEL_DIESEL">Diesel / Fuel (JCB/Fleet)</option>
                        <option value="WORKER_BATA">Worker Tea / Lunch Bata</option>
                        <option value="WORKER_WAGE">Worker Daily Wage</option>
                        <option value="MATERIAL_PURCHASE">Emergency Materials</option>
                        <option value="OFFICE_EXPENSE">Office Petty Cash</option>
                        <option value="OTHER">Miscellaneous Expense</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Income specific: Link to active Enquiry */}
              {entryMode === 'INCOME' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                      Link to Customer Ticket (Optional)
                    </label>
                    <select
                      value={selectedEnquiryId}
                      onChange={(e) => handleEnquirySelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 font-medium text-gray-200 focus:outline-none focus:border-[#2A835F]"
                    >
                      <option value="">-- Manual Customer Entry --</option>
                      {enquiries.map((enq) => (
                        <option key={enq.id} value={enq.id}>
                          {enq.trackingNumber} - {enq.customerName} ({enq.serviceName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                      Customer Name & Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ajsal Rahman (Nileshwaram)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 font-medium text-gray-200 focus:outline-none focus:border-[#2A835F]"
                    />
                  </div>
                </>
              ) : (
                /* Expense specific */
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                      Paid To (Petrol Bunk / Worker / Store Name)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Indian Oil Bunk Kanhangad or Squad Lead Ratheesh"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 font-medium text-gray-200 focus:outline-none focus:border-[#2A835F]"
                    />
                  </div>

                  {category === 'WORKER_WAGE' || category === 'WORKER_BATA' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                        Select Worker (Optional)
                      </label>
                      <select
                        value={workerId}
                        onChange={(e) => setWorkerId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 font-medium text-gray-200 focus:outline-none focus:border-[#2A835F]"
                      >
                        <option value="">-- General Squad Payout --</option>
                        {workers.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name || w.username} ({w.phone || 'Worker'})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </>
              )}

              {/* Reference Number */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                  UPI Ref ID / Receipt Bill No. (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI-2948192 or Bill-492"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 font-mono text-xs text-gray-200 focus:outline-none focus:border-[#2A835F]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. 40L Diesel for JCB or Advance for plumbing project"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 font-medium text-gray-200 focus:outline-none focus:border-[#2A835F]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold transition-all shadow-md"
                >
                  {submitting ? 'Saving...' : 'Save & Submit Voucher'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
