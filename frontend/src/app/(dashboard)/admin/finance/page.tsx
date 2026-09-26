'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import {
  FinanceService,
  FinancialTransaction,
  FinancialSummary,
  CalendarDayFinance,
  TransactionType,
  TransactionCategory,
  PaymentMethod,
  FinancialStatus,
  CreateTransactionPayload,
  EnquiryService,
  peopleService,
  ServiceEnquiry,
  User,
} from '@/services';
import {
  IndianRupee,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Fuel,
  HardHat,
  ShoppingBag,
  Wrench,
  Building,
  CreditCard,
  QrCode,
  Banknote,
  FileText,
  Eye,
  Edit2,
  Trash2,
  X,
  Check,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const SERVICE_OPTIONS = [
  'Cococare - Palm Tree Harvesting & Maintenance',
  'JCB Heavy Machinery & Earth Excavation',
  'Plastering & Masonry Services',
  'Commercial & Residential Painting',
  'Tile, Marble & Granite Installation',
  'Electrical & 3-Phase Wiring Systems',
  'Plumbing & Drainage Systems',
  'Borewell Drilling & Groundwater Testing',
  'General Operations & Overhead',
];

const INCOME_CATEGORIES: { id: TransactionCategory; label: string; ml: string }[] = [
  { id: 'SERVICE_PAYMENT', label: 'Service Payment', ml: 'സേവന പേയ്‌മെന്റ്' },
  { id: 'ADVANCE_PAYMENT', label: 'Advance Deposit', ml: 'അഡ്വാൻസ് തുക' },
  { id: 'MILESTONE_PAYMENT', label: 'Milestone Settlement', ml: 'ഘട്ടംഘട്ടമായ പേയ്‌മെന്റ്' },
  { id: 'FINAL_SETTLEMENT', label: 'Final Settlement', ml: 'അന്തിമ ബിൽ തീർപ്പാക്കൽ' },
  { id: 'OTHER', label: 'Other Income', ml: 'മറ്റ് വരുമാനം' },
];

const EXPENSE_CATEGORIES: { id: TransactionCategory; label: string; ml: string }[] = [
  { id: 'FUEL_DIESEL', label: 'Fuel & Diesel (JCB/Fleet)', ml: 'ഡീസൽ / ഇന്ധനം' },
  { id: 'WORKER_WAGE', label: 'Worker Daily Wage', ml: 'തൊഴിലാളി ദിനക്കൂലി' },
  { id: 'WORKER_BATA', label: 'Worker Food & Travel Bata', ml: 'ഭക്ഷണ / യാത്രാ ബത്ത' },
  { id: 'MATERIAL_PURCHASE', label: 'Materials (Cement, Sand, Paint)', ml: 'നിർമ്മാണ സാമഗ്രികൾ' },
  { id: 'EQUIPMENT_REPAIR', label: 'Equipment Repair & Spares', ml: 'മെഷീൻ റിപ്പയറിംഗ്' },
  { id: 'OFFICE_EXPENSE', label: 'Office & Overhead Expense', ml: 'ഓഫീസ് ചെലവ്' },
  { id: 'TRANSPORT_TRAVEL', label: 'Transport & Machinery Freight', ml: 'മെഷീൻ ട്രാൻസ്‌പോർട്ട്' },
  { id: 'OTHER', label: 'Miscellaneous Expense', ml: 'മറ്റ് ചെലവുകൾ' },
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: any }[] = [
  { id: 'UPI', label: 'UPI / GPay / PhonePe', icon: QrCode },
  { id: 'CASH', label: 'Cash on Site / Desk', icon: Banknote },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/IMPS)', icon: CreditCard },
  { id: 'CHEQUE', label: 'Cheque Payment', icon: FileText },
];

const CATEGORY_COLORS = ['#2A835F', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#64748B'];

export default function AdminFinancePage() {
  const { token, user } = useAuth();
  const { isDark } = useAdminTheme();

  // Date State - Default current year and month (2026-09)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 26)); // September 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-26');
  const [activeTab, setActiveTab] = useState<'calendar' | 'ledger' | 'analytics'>('calendar');

  // Data State
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [calendarFeed, setCalendarFeed] = useState<CalendarDayFinance[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);

  // Filter State for Ledger
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterService, setFilterService] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilterMode, setDateFilterMode] = useState<'selected' | 'month' | 'all'>('selected');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDayDrawerOpen, setIsDayDrawerOpen] = useState(false);
  const [inspectTxn, setInspectTxn] = useState<FinancialTransaction | null>(null);
  const [editingTxn, setEditingTxn] = useState<FinancialTransaction | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateTransactionPayload>({
    type: 'INCOME',
    category: 'SERVICE_PAYMENT',
    amount: 0,
    date: '2026-09-26',
    paymentMethod: 'UPI',
    serviceType: SERVICE_OPTIONS[0],
    customerName: '',
    vendorName: '',
    referenceNumber: '',
    notes: '',
    enquiryId: '',
    workerId: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const currentMonthStr = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, [currentDate]);

  const monthLabel = useMemo(() => {
    return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Fetch Summary & Calendar Data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sumRes, calRes] = await Promise.all([
        FinanceService.getSummary(token, { month: currentMonthStr }),
        FinanceService.getCalendarFeed(token, currentMonthStr),
      ]);
      setSummary(sumRes);
      setCalendarFeed(calRes.days);
    } catch (err: any) {
      console.error('Failed to load finance data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentMonthStr]);

  // Fetch Filtered Transactions
  const fetchTransactions = useCallback(async () => {
    try {
      const params: any = {};
      if (dateFilterMode === 'selected' && selectedDateStr) {
        params.date = selectedDateStr;
      } else if (dateFilterMode === 'month') {
        params.month = currentMonthStr;
      }

      if (filterType !== 'ALL') params.type = filterType;
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (filterCategory !== 'ALL') params.category = filterCategory;
      if (filterService !== 'ALL') params.serviceType = filterService;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      params.limit = 100;

      const res = await FinanceService.getTransactions(token, params);
      setTransactions(res.items);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  }, [token, selectedDateStr, dateFilterMode, currentMonthStr, filterType, filterStatus, filterCategory, filterService, searchQuery]);

  // Initial lookup of Enquiries and Workers for dropdowns
  useEffect(() => {
    if (!token) return;
    fetchData();
    EnquiryService.getAllEnquiries({ limit: 100 }, token)
      .then((res: any) => setEnquiries(res.enquiries || []))
      .catch(() => {});
    EnquiryService.getActiveWorkers(token)
      .then((res: any) => setWorkers(res.workers || []))
      .catch(() => {});
  }, [token, fetchData]);

  useEffect(() => {
    if (!token) return;
    fetchTransactions();
  }, [token, fetchTransactions]);

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Blank cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const feed = calendarFeed.find((f) => f.date === dStr);
      days.push({
        dayNumber: day,
        dateString: dStr,
        feed: feed || {
          date: dStr,
          totalIncome: 0,
          totalExpense: 0,
          netAmount: 0,
          count: 0,
          hasPending: false,
        },
      });
    }

    return days;
  }, [currentDate, calendarFeed]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDay = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setDateFilterMode('selected');
    setIsDayDrawerOpen(true);
  };

  const openCreateForDay = (dateStr?: string) => {
    const targetDate = dateStr || selectedDateStr || '2026-09-26';
    setFormData({
      type: 'INCOME',
      category: 'SERVICE_PAYMENT',
      amount: 0,
      date: targetDate,
      paymentMethod: 'UPI',
      serviceType: SERVICE_OPTIONS[0],
      customerName: '',
      vendorName: '',
      referenceNumber: '',
      notes: '',
      enquiryId: '',
      workerId: '',
    });
    setEditingTxn(null);
    setActionError(null);
    setIsCreateModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      setActionError('Please enter a valid amount greater than ₹0.');
      return;
    }
    setFormSubmitting(true);
    setActionError(null);
    try {
      if (editingTxn) {
        await FinanceService.updateTransaction(token, editingTxn.id, formData);
        showToast('Transaction updated successfully');
      } else {
        await FinanceService.createTransaction(token, formData);
        showToast('Transaction recorded successfully');
      }
      setIsCreateModalOpen(false);
      setEditingTxn(null);
      fetchData();
      fetchTransactions();
    } catch (err: any) {
      setActionError(err.message || 'Operation failed. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleVerify = async (id: string, status: FinancialStatus) => {
    try {
      await FinanceService.verifyTransaction(token, id, { status });
      showToast(`Transaction ${status.toLowerCase()} successfully`);
      fetchData();
      fetchTransactions();
      if (inspectTxn?.id === id) {
        setInspectTxn((prev) => prev ? { ...prev, status } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to verify transaction');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this financial record? This action is logged.')) {
      return;
    }
    try {
      await FinanceService.deleteTransaction(token, id);
      showToast('Transaction deleted successfully');
      setInspectTxn(null);
      fetchData();
      fetchTransactions();
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction');
    }
  };

  // Day specific items for drawer
  const dayTransactions = useMemo(() => {
    return transactions.filter((t) => t.dateString === selectedDateStr);
  }, [transactions, selectedDateStr]);

  const dayTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    dayTransactions.forEach((t) => {
      if (t.type === 'INCOME') income += Number(t.amount);
      else expense += Number(t.amount);
    });
    return { income, expense, net: income - expense };
  }, [dayTransactions]);

  // Analytics Chart Data
  const categoryChartData = useMemo(() => {
    if (!summary?.expenseByCategory) return [];
    return Object.entries(summary.expenseByCategory).map(([key, val]) => ({
      name: key.replace(/_/g, ' '),
      value: val,
    }));
  }, [summary]);

  const serviceChartData = useMemo(() => {
    if (!summary?.incomeByServiceType) return [];
    return Object.entries(summary.incomeByServiceType).map(([key, val]) => ({
      name: key.length > 20 ? key.substring(0, 18) + '...' : key,
      fullName: key,
      revenue: val,
    }));
  }, [summary]);

  return (
    <div className={`min-h-screen transition-colors duration-200 p-4 sm:p-6 lg:p-8 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-[#2A835F] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/30 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}

      {/* Header Bento Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-8 border shadow-xl ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#2A835F]/20 to-transparent pointer-events-none rounded-full blur-3xl -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#EBF6F1] text-[#2A835F] border border-[#2A835F]/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                KK Group Command Center
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                Kerala Operations
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <span>Business Finance & Cashbook</span>
              <span className="text-lg sm:text-2xl font-bold text-[#2A835F] opacity-90 hidden sm:inline">
                ധനകാര്യ മാനേജ്‌മെന്റ്
              </span>
            </h1>
            <p className={`mt-2 text-sm max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Daily calendar transaction feeding, fleet & equipment meter billing, wage disbursements, and verified voucher audits across Kasaragod & Kerala operational districts.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => openCreateForDay()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold text-sm shadow-lg shadow-[#2A835F]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Record Transaction</span>
            </button>

            <button
              onClick={() => fetchData()}
              disabled={isLoading}
              className={`p-3 rounded-2xl border transition-all ${
                isDark ? 'border-slate-800 bg-slate-800/80 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#2A835F]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        
        {/* Total Inflow */}
        <div className={`p-6 rounded-3xl border transition-all hover:shadow-lg ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Inflows (വരുമാനം)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-[#2A835F]">
              <ArrowDownRight className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{(summary?.totalIncome || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{monthLabel}</span>
            <span className="font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Today: ₹{(summary?.todayIncome || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Total Outflow */}
        <div className={`p-6 rounded-3xl border transition-all hover:shadow-lg ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Outflows (ചെലവ്)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <ArrowUpRight className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
            ₹{(summary?.totalExpense || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{monthLabel}</span>
            <span className="font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
              Today: ₹{(summary?.todayExpense || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Net Cash Flow / Profit */}
        <div className={`p-6 rounded-3xl border transition-all hover:shadow-lg ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Net Margin (ലാഭം)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#EBF6F1] flex items-center justify-center text-[#2A835F]">
              <TrendingUp className="w-5 h-5 text-[#2A835F]" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${
            (summary?.netProfit || 0) >= 0 ? 'text-[#2A835F]' : 'text-rose-600'
          }`}>
            ₹{(summary?.netProfit || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Margin: <strong className="text-emerald-500">{summary?.profitMargin || 0}%</strong>
            </span>
            <span className={`font-semibold px-2 py-0.5 rounded-full ${
              (summary?.todayNet || 0) >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
            }`}>
              Today: ₹{(summary?.todayNet || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Pending Verification Vouchers */}
        <div 
          onClick={() => {
            setActiveTab('ledger');
            setFilterStatus('PENDING');
          }}
          className={`p-6 rounded-3xl border transition-all hover:shadow-lg cursor-pointer ${
            isDark ? 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40' : 'bg-white border-slate-200/90 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Pending Approvals (സ്റ്റാഫ്)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-500">
            {summary?.pendingVerificationCount || 0} <span className="text-base font-normal text-slate-400">Entries</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Awaiting Super Admin</span>
            <span className="font-semibold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
              ₹{(summary?.pendingVerificationAmount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Main View Mode Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className={`p-1.5 rounded-2xl border flex items-center gap-1 w-full sm:w-auto ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/60 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'calendar'
                ? 'bg-[#2A835F] text-white shadow-md'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Interactive Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'ledger'
                ? 'bg-[#2A835F] text-white shadow-md'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Transaction Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#2A835F] text-white shadow-md'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Financial Analytics</span>
          </button>
        </div>

        {/* Month Navigator Controls */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <button
            onClick={handlePrevMonth}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="font-extrabold text-sm px-3 min-w-[140px] text-center">
            {monthLabel}
          </span>

          <button
            onClick={handleNextMonth}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE CALENDAR */}
      {activeTab === 'calendar' && (
        <div className={`rounded-3xl border shadow-xl overflow-hidden p-6 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>{monthLabel} Daily Finance Grid</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#EBF6F1] text-[#2A835F]">
                  Click date to view / feed
                </span>
              </h2>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Showing daily collections, field expenditure, and net balance for each day in Kerala time.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Inflow (വരുമാനം)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Outflow (ചെലവ്)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Staff Pending</span>
              </span>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {calendarDays.map((cell, idx) => {
              if (!cell) {
                return (
                  <div
                    key={`blank-${idx}`}
                    className={`min-h-[90px] sm:min-h-[120px] rounded-2xl border border-dashed opacity-20 ${
                      isDark ? 'border-slate-800' : 'border-slate-200'
                    }`}
                  />
                );
              }

              const isSelected = cell.dateString === selectedDateStr;
              const hasActivity = cell.feed.count > 0;
              const isToday = cell.dateString === '2026-09-26';

              return (
                <div
                  key={cell.dateString}
                  onClick={() => handleSelectDay(cell.dateString)}
                  className={`min-h-[95px] sm:min-h-[125px] p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'border-[#2A835F] ring-2 ring-[#2A835F]/30 bg-[#2A835F]/5 shadow-md'
                      : isDark
                      ? 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                      : 'border-slate-200/90 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  {/* Top Bar of cell */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm font-extrabold px-1.5 py-0.5 rounded-lg ${
                      isToday
                        ? 'bg-[#2A835F] text-white shadow-xs'
                        : isSelected
                        ? 'text-[#2A835F]'
                        : isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {cell.dayNumber}
                    </span>

                    {cell.feed.hasPending && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Pending staff entry" />
                    )}
                  </div>

                  {/* Mid Content: Inflow & Outflow Chips */}
                  <div className="space-y-1 my-1">
                    {cell.feed.totalIncome > 0 && (
                      <div className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md truncate">
                        +₹{cell.feed.totalIncome.toLocaleString('en-IN')}
                      </div>
                    )}
                    {cell.feed.totalExpense > 0 && (
                      <div className="text-[10px] sm:text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md truncate">
                        -₹{cell.feed.totalExpense.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Net movement or count */}
                  <div className="text-[9px] sm:text-[10px] flex items-center justify-between text-slate-400">
                    {hasActivity ? (
                      <>
                        <span className="font-semibold text-slate-500">{cell.feed.count} txn</span>
                        <span className={`font-bold ${
                          cell.feed.netAmount >= 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {cell.feed.netAmount >= 0 ? '+' : ''}₹{Math.abs(cell.feed.netAmount).toLocaleString('en-IN')}
                        </span>
                      </>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 text-[#2A835F] font-semibold transition-opacity">
                        + Add entry
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW 2: COMPREHENSIVE LEDGER TABLE */}
      {activeTab === 'ledger' && (
        <div className={`rounded-3xl border shadow-xl overflow-hidden ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Filter Toolbar */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Txn Number, Customer, Vendor, Notes or Ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2A835F] ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Date Scope Filter */}
              <div className={`p-1 rounded-2xl border flex items-center ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  onClick={() => setDateFilterMode('selected')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dateFilterMode === 'selected'
                      ? 'bg-[#2A835F] text-white'
                      : isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Selected Day ({selectedDateStr || 'Today'})
                </button>
                <button
                  onClick={() => setDateFilterMode('month')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dateFilterMode === 'month'
                      ? 'bg-[#2A835F] text-white'
                      : isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  This Month ({monthLabel})
                </button>
                <button
                  onClick={() => setDateFilterMode('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dateFilterMode === 'all'
                      ? 'bg-[#2A835F] text-white'
                      : isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  All Dates
                </button>
              </div>

            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="ALL">All Types (Income & Expense)</option>
                <option value="INCOME">Income Only (വരുമാനം)</option>
                <option value="EXPENSE">Expense Only (ചെലവ്)</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="ALL">All Verification Status</option>
                <option value="VERIFIED">Verified & Approved</option>
                <option value="PENDING">Pending Admin Verification</option>
                <option value="REJECTED">Rejected</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="ALL">All Categories</option>
                <optgroup label="Income">
                  {INCOME_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Expenses">
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </optgroup>
              </select>

              {/* Service Unit Filter */}
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="ALL">All Service Units / Squads</option>
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className={`border-b text-xs font-bold uppercase tracking-wider ${
                isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <tr>
                  <th className="py-4 px-4 sm:px-6">Transaction</th>
                  <th className="py-4 px-4">Date & Service</th>
                  <th className="py-4 px-4">Party / Payee</th>
                  <th className="py-4 px-4">Payment Mode</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No financial records matching your filters.
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => {
                    const isIncome = txn.type === 'INCOME';
                    return (
                      <tr 
                        key={txn.id} 
                        className={`transition-colors hover:bg-slate-500/5 ${
                          txn.status === 'PENDING' ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        {/* Txn Number */}
                        <td className="py-4 px-4 sm:px-6 font-mono font-bold">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span className="text-[#2A835F] hover:underline cursor-pointer" onClick={() => setInspectTxn(txn)}>
                              {txn.transactionNumber}
                            </span>
                          </div>
                          <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                            {txn.category.replace(/_/g, ' ')}
                          </div>
                        </td>

                        {/* Date & Service */}
                        <td className="py-4 px-4">
                          <div className="font-semibold">{txn.dateString}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[180px]">
                            {txn.serviceType || 'General Overhead'}
                          </div>
                        </td>

                        {/* Party / Payee */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {txn.customerName || txn.vendorName || 'Direct Cash Transaction'}
                          </div>
                          {txn.enquiry && (
                            <div className="text-[11px] text-[#2A835F]">
                              Ticket: {txn.enquiry.trackingNumber}
                            </div>
                          )}
                        </td>

                        {/* Payment Mode */}
                        <td className="py-4 px-4">
                          <span className="font-semibold">{txn.paymentMethod}</span>
                          {txn.referenceNumber && (
                            <div className="text-[11px] font-mono text-slate-400 truncate max-w-[120px]">
                              {txn.referenceNumber}
                            </div>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-4">
                          <span className={`font-black text-sm sm:text-base ${
                            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {isIncome ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          {txn.status === 'VERIFIED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                          {txn.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                              <Clock className="w-3 h-3" />
                              Pending Approval
                            </span>
                          )}
                          {txn.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              <AlertCircle className="w-3 h-3" />
                              Rejected
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {txn.status === 'PENDING' && (
                              <button
                                onClick={() => handleVerify(txn.id, 'VERIFIED')}
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                                title="Approve & Verify"
                              >
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            )}
                            <button
                              onClick={() => setInspectTxn(txn)}
                              className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(txn.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* VIEW 3: ANALYTICS & INSIGHTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Service Unit Revenue Breakdown */}
            <div className={`p-6 rounded-3xl border shadow-xl ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="text-base font-bold mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2A835F]" />
                <span>Revenue by Service Squad (വരുമാന സ്രോതസ്സുകൾ)</span>
              </h3>
              <p className={`text-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Comparative inflow generated by JCB, Cococare, Tiling, and Electrical units.
              </p>

              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceChartData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis type="number" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#2A835F" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Distribution by Category */}
            <div className={`p-6 rounded-3xl border shadow-xl ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="text-base font-bold mb-1 flex items-center gap-2">
                <Fuel className="w-4 h-4 text-rose-500" />
                <span>Expense Breakdown by Category (ചെലവ് വിതരണം)</span>
              </h3>
              <p className={`text-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Operational outflows: Diesel fuel, worker daily wages, site bata, and building materials.
              </p>

              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                      label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Expenditure']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DAY LEDGER DRAWER */}
      {isDayDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-lg h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between shadow-2xl ${
            isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
          }`}>
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2A835F]">
                    Kerala Daily Feed
                  </span>
                  <h3 className="text-xl font-black mt-0.5">
                    {selectedDateStr} Ledger
                  </h3>
                </div>
                <button
                  onClick={() => setIsDayDrawerOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Day Summary Cards */}
              <div className="grid grid-cols-3 gap-2.5 mb-6 text-center">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Inflow</div>
                  <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    ₹{dayTotals.income.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <div className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">Outflow</div>
                  <div className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 mt-1">
                    ₹{dayTotals.expense.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-500/10 border border-slate-500/20">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Net Day</div>
                  <div className={`text-sm sm:text-base font-black mt-1 ${
                    dayTotals.net >= 0 ? 'text-[#2A835F]' : 'text-rose-500'
                  }`}>
                    ₹{dayTotals.net.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Day Line Items List */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Transactions ({dayTransactions.length})</span>
                  <span>Amount</span>
                </div>

                {dayTransactions.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-sm">
                    No transactions recorded on this date yet.
                  </div>
                ) : (
                  dayTransactions.map((txn) => {
                    const isIncome = txn.type === 'INCOME';
                    return (
                      <div
                        key={txn.id}
                        onClick={() => setInspectTxn(txn)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
                          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#2A835F]">
                            {txn.transactionNumber}
                          </span>
                          <span className={`font-black text-sm ${
                            isIncome ? 'text-emerald-500' : 'text-rose-500'
                          }`}>
                            {isIncome ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-xs font-bold mt-1 text-slate-700 dark:text-slate-200 truncate">
                          {txn.customerName || txn.vendorName || txn.category.replace(/_/g, ' ')}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>{txn.paymentMethod}</span>
                          <span className={`font-semibold ${
                            txn.status === 'VERIFIED' ? 'text-emerald-500' : 'text-amber-500'
                          }`}>
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Button in Drawer */}
            <button
              onClick={() => openCreateForDay(selectedDateStr)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold text-sm shadow-xl transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Record Entry for {selectedDateStr}</span>
            </button>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TRANSACTION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2A835F]">
                  Financial Entry
                </span>
                <h3 className="text-xl font-black mt-0.5">
                  {editingTxn ? 'Edit Financial Entry' : 'Record Business Transaction'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3.5 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs sm:text-sm">
              
              {/* Type Switcher */}
              <div className={`p-1.5 rounded-2xl border flex items-center gap-1 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'INCOME', category: 'SERVICE_PAYMENT' })}
                  className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
                    formData.type === 'INCOME'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🟢 Inflow / Income (വരുമാനം)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'EXPENSE', category: 'FUEL_DIESEL' })}
                  className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
                    formData.type === 'EXPENSE'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔴 Outflow / Expense (ചെലവ്)
                </button>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                    Amount (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      min={1}
                      step="any"
                      placeholder="0.00"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className={`w-full pl-8 pr-4 py-2.5 rounded-xl border font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#2A835F] ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                    Transaction Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-[#2A835F] ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-[#2A835F] ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {formData.type === 'INCOME' ? (
                      INCOME_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.label} ({c.ml})</option>
                      ))
                    ) : (
                      EXPENSE_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.label} ({c.ml})</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                    Payment Method *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-[#2A835F] ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Service Unit & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                    Service Squad / Unit
                  </label>
                  <select
                    value={formData.serviceType || ''}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-[#2A835F] ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                    Reference / UPI Ref No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GPay/9948201948 or Bill-8492"
                    value={formData.referenceNumber || ''}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#2A835F] ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              {/* Party: Customer or Vendor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.type === 'INCOME' ? (
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                      Customer Name & Place
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Santhosh Kumar (Kanhangad)"
                      value={formData.customerName || ''}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-[#2A835F] ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                      Vendor / Payee / Bunk
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HP Fuel Station Nileshwar or UltraTech Bunk"
                      value={formData.vendorName || ''}
                      onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-[#2A835F] ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                )}

                {/* Optional Link to Service Enquiry */}
                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                    Link to Enquiry Ticket (Optional)
                  </label>
                  <select
                    value={formData.enquiryId || ''}
                    onChange={(e) => setFormData({ ...formData, enquiryId: e.target.value || undefined })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-[#2A835F] ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="">-- No Direct Ticket Link --</option>
                    {enquiries.map((enq) => (
                      <option key={enq.id} value={enq.id}>
                        {enq.trackingNumber} - {enq.customerName} ({enq.serviceName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                  Notes & Operational Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 50L diesel for JCB KL-60-A-4122 or Advance 12hr earthwork..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-[#2A835F] ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold text-xs shadow-lg transition-all"
                >
                  {formSubmitting ? 'Saving...' : editingTxn ? 'Update Entry' : 'Record Transaction'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* INSPECT TRANSACTION MODAL */}
      {inspectTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2A835F]">
                  Transaction Voucher
                </span>
                <h3 className="text-xl font-mono font-black mt-0.5">
                  {inspectTxn.transactionNumber}
                </h3>
              </div>
              <button
                onClick={() => setInspectTxn(null)}
                className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-500/10">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Amount</div>
                  <div className={`text-2xl font-black mt-0.5 ${
                    inspectTxn.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {inspectTxn.type === 'INCOME' ? '+' : '-'}₹{inspectTxn.amount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase font-bold">Status</div>
                  <div className="font-bold text-sm mt-0.5">{inspectTxn.status}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-400 uppercase text-[11px] font-bold">Type & Category</div>
                  <div className="font-semibold mt-0.5">{inspectTxn.type} • {inspectTxn.category.replace(/_/g, ' ')}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase text-[11px] font-bold">Date</div>
                  <div className="font-semibold mt-0.5">{inspectTxn.dateString}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-400 uppercase text-[11px] font-bold">Party / Payee</div>
                  <div className="font-semibold mt-0.5">{inspectTxn.customerName || inspectTxn.vendorName || 'Direct'}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase text-[11px] font-bold">Payment Method</div>
                  <div className="font-semibold mt-0.5">{inspectTxn.paymentMethod} {inspectTxn.referenceNumber ? `(${inspectTxn.referenceNumber})` : ''}</div>
                </div>
              </div>

              <div>
                <div className="text-slate-400 uppercase text-[11px] font-bold">Service Squad</div>
                <div className="font-semibold mt-0.5">{inspectTxn.serviceType || 'General Operations'}</div>
              </div>

              {inspectTxn.notes && (
                <div className="p-3.5 rounded-xl bg-slate-500/5 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-400 uppercase text-[10px] font-bold">Notes</div>
                  <div className="mt-1 text-slate-700 dark:text-slate-300">{inspectTxn.notes}</div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Recorded by: <strong>{inspectTxn.recordedBy?.name || inspectTxn.recordedBy?.username || 'Staff'}</strong></span>
                <span>Role: <strong>{inspectTxn.recordedBy?.role}</strong></span>
              </div>

              {/* Action Buttons in Inspect */}
              <div className="flex items-center justify-end gap-2.5 pt-4">
                {inspectTxn.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleVerify(inspectTxn.id, 'REJECTED')}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 font-bold text-xs hover:bg-rose-500/20"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleVerify(inspectTxn.id, 'VERIFIED')}
                      className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                    >
                      Approve & Verify
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(inspectTxn.id)}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 font-bold text-xs hover:bg-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
