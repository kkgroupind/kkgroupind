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
import { ConfirmationModal } from '@/components/Admin/confirmation-modal';
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
  LayoutGrid,
  List,
} from 'lucide-react';
import { AdminDropdown, AdminDropdownOption } from '@/components/Admin/admin-dropdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ComboboxDropdown } from '@/components/ui/combobox-dropdown';
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

const PAYMENT_METHODS: { id: PaymentMethod; label: string; sub: string; icon: any }[] = [
  { id: 'UPI', label: 'UPI / GPay / PhonePe', sub: 'Instant Digital Payment', icon: QrCode },
  { id: 'CASH', label: 'Cash on Site / Desk', sub: 'Physical Currency Handover', icon: Banknote },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/IMPS)', sub: 'Direct Bank Settlement', icon: CreditCard },
  { id: 'CHEQUE', label: 'Cheque Payment', sub: 'Bank Cheque / Voucher', icon: FileText },
];

const CATEGORY_COLORS = ['#2A835F', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#64748B'];

function formatCompactINR(val: number): string {
  if (!val) return '0';
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}${(abs / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `${sign}${(abs / 100000).toFixed(abs % 100000 === 0 ? 0 : 1)}L`;
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}k`;
  return `${sign}${abs}`;
}

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
  const [txnViewMode, setTxnViewMode] = useState<'grid' | 'table'>('grid');

  const filterTypeOptions: AdminDropdownOption[] = [
    { value: 'ALL', label: 'All Types (Income & Expense)' },
    {
      value: 'INCOME',
      label: 'Income Only (വരുമാനം)',
      badge: 'Income',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    {
      value: 'EXPENSE',
      label: 'Expense Only (ചെലവ്)',
      badge: 'Expense',
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    },
  ];

  const filterStatusOptions: AdminDropdownOption[] = [
    { value: 'ALL', label: 'All Verification Status' },
    {
      value: 'VERIFIED',
      label: 'Verified & Approved',
      badge: 'Verified',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    {
      value: 'PENDING',
      label: 'Pending Admin Verification',
      badge: 'Pending',
      badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    },
    {
      value: 'REJECTED',
      label: 'Rejected',
      badge: 'Rejected',
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    },
  ];

  const filterCategoryOptions: AdminDropdownOption[] = useMemo(
    () => [
      { value: 'ALL', label: 'All Categories' },
      ...INCOME_CATEGORIES.map((c) => ({ value: c.id, label: `Income: ${c.label}` })),
      ...EXPENSE_CATEGORIES.map((c) => ({ value: c.id, label: `Expense: ${c.label}` })),
    ],
    [],
  );

  const filterServiceOptions: AdminDropdownOption[] = useMemo(
    () => [
      { value: 'ALL', label: 'All Service Squads' },
      ...SERVICE_OPTIONS.map((s) => ({ value: s, label: s })),
    ],
    [],
  );

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDayDrawerOpen, setIsDayDrawerOpen] = useState(false);
  const [inspectTxn, setInspectTxn] = useState<FinancialTransaction | null>(null);
  const [editingTxn, setEditingTxn] = useState<FinancialTransaction | null>(null);
  const [deleteTxnTarget, setDeleteTxnTarget] = useState<FinancialTransaction | null>(null);
  const [isDeletingTxn, setIsDeletingTxn] = useState(false);

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

  const modalCategoryOptions: AdminDropdownOption[] = useMemo(() => {
    const cats = formData.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return cats.map((c) => ({
      value: c.id,
      label: c.label,
      description: c.ml,
    }));
  }, [formData.type]);

  const modalPaymentOptions: AdminDropdownOption[] = useMemo(
    () =>
      PAYMENT_METHODS.map((m) => ({
        value: m.id,
        label: m.label,
        description: m.sub,
        icon: m.icon,
      })),
    [],
  );

  const modalServiceOptions: AdminDropdownOption[] = useMemo(
    () =>
      SERVICE_OPTIONS.map((s) => {
        const parts = s.split(' - ');
        return {
          value: s,
          label: parts[0] || s,
          description: parts[1] || undefined,
        };
      }),
    [],
  );

  const modalEnquiryOptions: AdminDropdownOption[] = useMemo(
    () => [
      { value: '', label: '-- No Direct Ticket Link --' },
      ...enquiries.map((e) => ({
        value: e.id,
        label: `${e.trackingNumber} • ${e.customerName}`,
        description: e.serviceName,
        badge: e.status,
        badgeColor:
          e.status === 'COMPLETED'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : e.status === 'ASSIGNED' || e.status === 'IN_PROGRESS'
            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      })),
    ],
    [enquiries],
  );

  const modalWorkerOptions: AdminDropdownOption[] = useMemo(
    () => [
      { value: '', label: '-- Direct Payee / No Worker Assigned --' },
      ...workers.map((w) => ({
        value: w.id,
        label: w.name || w.username || 'Field Operative',
        description: w.phone ? `Phone: ${w.phone}` : 'Registered Field Worker',
        badge: 'Operative',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      })),
    ],
    [workers],
  );

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

  const handleOpenEdit = (txn: FinancialTransaction) => {
    setEditingTxn(txn);
    setFormData({
      type: txn.type,
      category: txn.category,
      amount: Number(txn.amount) || 0,
      date: txn.dateString || (txn.date ? txn.date.split('T')[0] : '2026-09-26'),
      paymentMethod: txn.paymentMethod || 'UPI',
      serviceType: txn.serviceType || SERVICE_OPTIONS[0],
      customerName: txn.customerName || '',
      vendorName: txn.vendorName || '',
      referenceNumber: txn.referenceNumber || '',
      notes: txn.notes || '',
      enquiryId: txn.enquiryId || '',
      workerId: txn.workerId || '',
    });
    setInspectTxn(null);
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
      const payload: CreateTransactionPayload = {
        ...formData,
        amount: Number(formData.amount),
        enquiryId: formData.enquiryId && formData.enquiryId.trim() ? formData.enquiryId.trim() : undefined,
        workerId: formData.workerId && formData.workerId.trim() ? formData.workerId.trim() : undefined,
        customerName: formData.customerName?.trim() || undefined,
        vendorName: formData.vendorName?.trim() || undefined,
        referenceNumber: formData.referenceNumber?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      };

      if (editingTxn) {
        await FinanceService.updateTransaction(token, editingTxn.id, payload);
        showToast('Transaction updated successfully');
      } else {
        await FinanceService.createTransaction(token, payload);
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

  const handleDelete = (id: string) => {
    const target = transactions.find((t) => t.id === id) || inspectTxn;
    if (target) {
      setDeleteTxnTarget(target);
    }
  };

  const confirmDeleteTransaction = async () => {
    if (!token || !deleteTxnTarget) return;

    setIsDeletingTxn(true);
    try {
      await FinanceService.deleteTransaction(token, deleteTxnTarget.id);
      showToast('Transaction deleted successfully');
      setInspectTxn(null);
      setDeleteTxnTarget(null);
      fetchData();
      fetchTransactions();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete transaction');
    } finally {
      setIsDeletingTxn(false);
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
    <div className={`min-h-screen transition-colors duration-200 p-4 sm:p-6 lg:p-8 ${isDark ? 'bg-[#0D0E12] text-gray-200' : 'bg-[#0D0E12] text-gray-200'}`}>
      
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-[#2A835F] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/30 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}

      {/* Simplified Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-100 flex items-center gap-2.5">
            <div className="p-2 bg-[#14151A] border border-gray-800 rounded-xl text-[#2A835F]">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span>Business Finance</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#2A835F]/15 text-[#2A835F] border border-[#2A835F]/20 hidden sm:inline">
              Cashbook &amp; Ledger
            </span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 hidden sm:block">
            Daily collections, field expenditure, and cash flow ledger
          </p>
        </div>

        {/* Quick Header Actions: Only Record Transaction & Reload */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => openCreateForDay()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#2A835F]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Record Transaction</span>
          </button>

          <button
            onClick={() => fetchData()}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl border border-gray-800 bg-[#14151A] hover:bg-[#1A1C23] text-gray-300 hover:text-white text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
            title="Reload Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#2A835F] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards Bar: Single row on mobile */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-4 lg:gap-6 mb-5 sm:mb-8">
        
        {/* Total Inflow */}
        <div className="p-2 sm:p-5 rounded-xl sm:rounded-2xl border bg-[#14151A] border-gray-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between gap-1 mb-1 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 truncate">
              Inflows<span className="hidden md:inline"> (വരുമാനം)</span>
            </span>
            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#2A835F] shrink-0">
              <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-[11px] sm:text-xl lg:text-2xl font-black text-emerald-400 truncate">
            ₹{(summary?.totalIncome || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-1 sm:mt-2 flex items-center justify-between text-[8px] sm:text-xs text-gray-400 truncate">
            <span className="hidden sm:inline">{monthLabel}</span>
            <span className="font-semibold text-emerald-400 bg-emerald-950/40 px-1 sm:px-1.5 py-0.5 rounded-full truncate">
              Today: ₹{formatCompactINR(summary?.todayIncome || 0)}
            </span>
          </div>
        </div>

        {/* Total Outflow */}
        <div className="p-2 sm:p-5 rounded-xl sm:rounded-2xl border bg-[#14151A] border-gray-800 hover:border-rose-500/30 transition-all flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between gap-1 mb-1 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 truncate">
              Outflows<span className="hidden md:inline"> (ചെലവ്)</span>
            </span>
            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
              <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-rose-400" />
            </div>
          </div>
          <div className="text-[11px] sm:text-xl lg:text-2xl font-black text-rose-400 truncate">
            ₹{(summary?.totalExpense || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-1 sm:mt-2 flex items-center justify-between text-[8px] sm:text-xs text-gray-400 truncate">
            <span className="hidden sm:inline">{monthLabel}</span>
            <span className="font-semibold text-rose-400 bg-rose-950/40 px-1 sm:px-1.5 py-0.5 rounded-full truncate">
              Today: ₹{formatCompactINR(summary?.todayExpense || 0)}
            </span>
          </div>
        </div>

        {/* Net Cash Flow / Profit */}
        <div className="p-2 sm:p-5 rounded-xl sm:rounded-2xl border bg-[#14151A] border-gray-800 hover:border-[#2A835F]/40 transition-all flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between gap-1 mb-1 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 truncate">
              Net<span className="hidden md:inline"> Margin</span>
            </span>
            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg bg-[#EBF6F1]/10 flex items-center justify-center text-[#2A835F] shrink-0">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#2A835F]" />
            </div>
          </div>
          <div className={`text-[11px] sm:text-xl lg:text-2xl font-black truncate ${
            (summary?.netProfit || 0) >= 0 ? 'text-[#2A835F]' : 'text-rose-400'
          }`}>
            ₹{(summary?.netProfit || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-1 sm:mt-2 flex items-center justify-between text-[8px] sm:text-xs text-gray-400 truncate">
            <span className="text-emerald-400 font-semibold">{summary?.profitMargin || 0}% margin</span>
            <span className="hidden sm:inline text-gray-500">
              Today: ₹{formatCompactINR(summary?.todayNet || 0)}
            </span>
          </div>
        </div>

        {/* Pending Verification Vouchers */}
        <div 
          onClick={() => {
            setActiveTab('ledger');
            setFilterStatus('PENDING');
          }}
          className="p-2 sm:p-5 rounded-xl sm:rounded-2xl border bg-[#14151A] border-gray-800 hover:border-amber-500/40 transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between gap-1 mb-1 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 truncate">
              Pending<span className="hidden md:inline"> (സ്റ്റാഫ്)</span>
            </span>
            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
            </div>
          </div>
          <div className="text-[11px] sm:text-xl lg:text-2xl font-black text-amber-400 truncate">
            {summary?.pendingVerificationCount || 0} <span className="text-[9px] sm:text-xs font-normal text-gray-400">entries</span>
          </div>
          <div className="mt-1 sm:mt-2 flex items-center justify-between text-[8px] sm:text-xs text-gray-400 truncate">
            <span className="hidden sm:inline">Awaiting Approval</span>
            <span className="font-semibold text-amber-400 bg-amber-950/40 px-1 sm:px-1.5 py-0.5 rounded-full truncate">
              ₹{formatCompactINR(summary?.pendingVerificationAmount || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Main View Mode Selector Tabs & Month Navigator */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-4 sm:mb-5">
        <div className="p-1 rounded-xl sm:rounded-2xl border border-gray-800 bg-[#14151A] flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'calendar'
                ? 'bg-[#2A835F] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'ledger'
                ? 'bg-[#2A835F] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#2A835F] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Month Navigator Controls */}
        <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 px-2.5 py-1 rounded-xl border border-gray-800 bg-[#14151A]">
          <button
            onClick={handlePrevMonth}
            className="p-1 sm:p-1.5 rounded-lg hover:bg-slate-800 text-gray-300 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-extrabold text-xs sm:text-sm px-2 sm:px-3 min-w-[120px] text-center text-gray-200">
            {monthLabel}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-1 sm:p-1.5 rounded-lg hover:bg-slate-800 text-gray-300 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="rounded-2xl sm:rounded-3xl border border-gray-800 bg-[#14151A] shadow-xl overflow-hidden p-3 sm:p-5">
          
          {/* Calendar Header with Legend */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-gray-100 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#2A835F]" />
                <span>{monthLabel} Daily Finance</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#EBF6F1] text-[#2A835F]">
                Tap date to view/feed
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-medium text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Inflow</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Outflow</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Pending</span>
              </span>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">
            <div><span className="sm:hidden">S</span><span className="hidden sm:inline">Sun</span></div>
            <div><span className="sm:hidden">M</span><span className="hidden sm:inline">Mon</span></div>
            <div><span className="sm:hidden">T</span><span className="hidden sm:inline">Tue</span></div>
            <div><span className="sm:hidden">W</span><span className="hidden sm:inline">Wed</span></div>
            <div><span className="sm:hidden">T</span><span className="hidden sm:inline">Thu</span></div>
            <div><span className="sm:hidden">F</span><span className="hidden sm:inline">Fri</span></div>
            <div><span className="sm:hidden">S</span><span className="hidden sm:inline">Sat</span></div>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              if (!cell) {
                return (
                  <div
                    key={`blank-${idx}`}
                    className="min-h-[44px] sm:min-h-[58px] rounded-lg sm:rounded-xl border border-dashed border-gray-800/40 opacity-20"
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
                  className={`min-h-[44px] sm:min-h-[58px] p-1 sm:p-2 rounded-lg sm:rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                    isSelected
                      ? 'border-[#2A835F] ring-1 sm:ring-2 ring-[#2A835F]/40 bg-[#2A835F]/10 shadow-sm'
                      : 'border-gray-800/80 bg-[#1A1C23]/60 hover:border-gray-700 hover:bg-[#1A1C23]'
                  }`}
                >
                  {/* Top Bar of cell */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] sm:text-xs font-extrabold px-1 py-0.2 rounded-md ${
                      isToday
                        ? 'bg-[#2A835F] text-white shadow-xs'
                        : isSelected
                        ? 'text-[#2A835F]'
                        : 'text-gray-300'
                    }`}>
                      {cell.dayNumber}
                    </span>

                    {cell.feed.hasPending && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="Pending staff entry" />
                    )}
                  </div>

                  {/* MOBILE VIEW (< sm): Compact smart pills that fit in 40px cell */}
                  <div className="sm:hidden my-0.5 space-y-0.5">
                    {cell.feed.totalIncome > 0 && (
                      <div className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-0.5 rounded truncate text-center leading-tight">
                        +{formatCompactINR(cell.feed.totalIncome)}
                      </div>
                    )}
                    {cell.feed.totalExpense > 0 && (
                      <div className="text-[8px] font-black text-rose-400 bg-rose-500/10 px-0.5 rounded truncate text-center leading-tight">
                        -{formatCompactINR(cell.feed.totalExpense)}
                      </div>
                    )}
                    {!hasActivity && (
                      <div className="h-1.5" />
                    )}
                  </div>

                  {/* DESKTOP VIEW (>= sm): Full Inflow & Outflow Chips */}
                  <div className="hidden sm:block space-y-1 my-1">
                    {cell.feed.totalIncome > 0 && (
                      <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md truncate">
                        +₹{cell.feed.totalIncome.toLocaleString('en-IN')}
                      </div>
                    )}
                    {cell.feed.totalExpense > 0 && (
                      <div className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md truncate">
                        -₹{cell.feed.totalExpense.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Net movement or count (Desktop) */}
                  <div className="hidden sm:flex text-[9px] items-center justify-between text-gray-400">
                    {hasActivity ? (
                      <>
                        <span className="font-semibold text-gray-400">{cell.feed.count} txn</span>
                        <span className={`font-bold ${
                          cell.feed.netAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'
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
          isDark ? 'bg-[#14151A] border-gray-800' : 'bg-[#14151A] border-gray-800'
        }`}>
          {/* Filter Toolbar */}
          <div className="p-6 border-b border-gray-800 dark:border-gray-800 space-y-4">
            
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Txn Number, Customer, Vendor, Notes or Ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2A835F] ${
                    isDark ? 'bg-slate-950 border-gray-800 text-white placeholder-slate-500' : 'bg-slate-50 border-gray-800 text-gray-200 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Date Scope Filter */}
              <div className={`p-1 rounded-2xl border flex items-center ${
                isDark ? 'bg-slate-950 border-gray-800' : 'bg-slate-100 border-gray-800'
              }`}>
                <button
                  onClick={() => setDateFilterMode('selected')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dateFilterMode === 'selected'
                      ? 'bg-[#2A835F] text-white'
                      : isDark ? 'text-gray-400' : 'text-gray-400'
                  }`}
                >
                  Selected Day ({selectedDateStr || 'Today'})
                </button>
                <button
                  onClick={() => setDateFilterMode('month')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dateFilterMode === 'month'
                      ? 'bg-[#2A835F] text-white'
                      : isDark ? 'text-gray-400' : 'text-gray-400'
                  }`}
                >
                  This Month ({monthLabel})
                </button>
                <button
                  onClick={() => setDateFilterMode('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dateFilterMode === 'all'
                      ? 'bg-[#2A835F] text-white'
                      : isDark ? 'text-gray-400' : 'text-gray-400'
                  }`}
                >
                  All Dates
                </button>
              </div>

            </div>

            {/* Dropdown Filters using AdminDropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Type Filter */}
              <div>
                <AdminDropdown
                  options={filterTypeOptions}
                  value={filterType}
                  onChange={(val) => setFilterType(val)}
                  variant="emerald"
                  theme="dark"
                  size="md"
                />
              </div>

              {/* Status Filter */}
              <div>
                <AdminDropdown
                  options={filterStatusOptions}
                  value={filterStatus}
                  onChange={(val) => setFilterStatus(val)}
                  variant="emerald"
                  theme="dark"
                  size="md"
                />
              </div>

              {/* Category Filter */}
              <div>
                <AdminDropdown
                  options={filterCategoryOptions}
                  value={filterCategory}
                  onChange={(val) => setFilterCategory(val)}
                  variant="emerald"
                  theme="dark"
                  size="md"
                  searchable
                />
              </div>

              {/* Service Unit Filter */}
              <div>
                <AdminDropdown
                  options={filterServiceOptions}
                  value={filterService}
                  onChange={(val) => setFilterService(val)}
                  variant="emerald"
                  theme="dark"
                  size="md"
                  searchable
                />
              </div>
            </div>

            {/* View Mode Toggle Header */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800 dark:border-gray-800">
              <span className="text-xs font-semibold text-gray-400">
                Found {transactions.length} transactions
              </span>

              <div className="flex items-center bg-[#1A1C23] border border-gray-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setTxnViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    txnViewMode === 'grid'
                      ? 'bg-[#7B4DFF] text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setTxnViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    txnViewMode === 'table'
                      ? 'bg-[#7B4DFF] text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Content: Default Bento Cards or Table */}
          {txnViewMode === 'grid' ? (
            <div className="p-4 sm:p-6">
              {transactions.length === 0 ? (
                <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#1A1C23] border border-gray-800 flex items-center justify-center text-gray-500 mb-3">
                    <FileSpreadsheet className="w-7 h-7 text-gray-500" />
                  </div>
                  <h4 className="font-semibold text-gray-200">No Financial Records Found</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    No transactions match your currently selected filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {transactions.map((txn) => {
                    const isIncome = txn.type === 'INCOME';
                    return (
                      <div
                        key={txn.id}
                        className="group bg-[#14151A] rounded-2xl border border-gray-800/80 hover:border-gray-700/80 p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden"
                      >
                        {/* Top ambient glow line */}
                        <div
                          className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-700/40 to-transparent ${
                            isIncome ? 'group-hover:via-emerald-500/70' : 'group-hover:via-rose-500/70'
                          } transition-all duration-300`}
                        />

                        <div>
                          {/* Header: Icon, Txn Code, Status */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative shrink-0">
                                <div
                                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${
                                    isIncome
                                      ? 'from-emerald-500 to-teal-600'
                                      : 'from-rose-500 to-pink-600'
                                  } p-[2px] shadow-sm`}
                                >
                                  <div className="w-full h-full bg-[#1A1C23] rounded-[14px] flex items-center justify-center font-bold text-xs text-gray-100">
                                    <IndianRupee
                                      className={`w-5 h-5 ${
                                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="min-w-0">
                                <span
                                  onClick={() => setInspectTxn(txn)}
                                  className="font-mono text-xs font-semibold text-gray-100 hover:text-emerald-400 transition-colors cursor-pointer truncate block"
                                >
                                  {txn.transactionNumber}
                                </span>
                                <span className="text-[11px] text-gray-400 truncate block mt-0.5">
                                  {txn.category.replace(/_/g, ' ')}
                                </span>
                              </div>
                            </div>

                            {txn.status === 'VERIFIED' ? (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider shrink-0">
                                Verified
                              </span>
                            ) : txn.status === 'PENDING' ? (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider shrink-0 animate-pulse">
                                Pending
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider shrink-0">
                                Rejected
                              </span>
                            )}
                          </div>

                          {/* Amount Banner */}
                          <div className="mb-3">
                            <span
                              className={`text-xl font-extrabold tracking-tight ${
                                isIncome ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {isIncome ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Middle Details (Border-y) */}
                          <div className="space-y-2 py-3 border-y border-gray-800/60 my-3 text-xs">
                            <div className="flex items-center justify-between text-gray-400">
                              <span className="flex items-center gap-1.5">
                                <CalendarIcon className="w-3.5 h-3.5 text-gray-500" />
                                <span>Date</span>
                              </span>
                              <span className="text-gray-200 font-medium">{txn.dateString}</span>
                            </div>

                            <div className="flex items-center justify-between text-gray-400">
                              <span className="flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-gray-500" />
                                <span>Service Squad</span>
                              </span>
                              <span className="text-gray-200 font-medium truncate max-w-[150px]">
                                {txn.serviceType || 'General'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-gray-400">
                              <span className="flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                                <span>Party</span>
                              </span>
                              <span className="text-gray-200 truncate max-w-[150px]">
                                {txn.customerName || txn.vendorName || 'Direct'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-gray-400">
                              <span className="flex items-center gap-1.5">
                                <Banknote className="w-3.5 h-3.5 text-gray-500" />
                                <span>Payment Mode</span>
                              </span>
                              <span className="text-gray-300 font-medium">
                                {txn.paymentMethod}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="flex items-center justify-between pt-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectTxn(txn)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#1A1C23] hover:bg-[#252834] text-gray-200 hover:text-white border border-gray-800 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-400" />
                            <span>Inspect</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(txn)}
                            className="p-2 rounded-xl text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-gray-800 hover:border-emerald-500/20 transition-all cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {txn.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleVerify(txn.id, 'VERIFIED')}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer"
                              title="Approve & Verify"
                            >
                              Approve
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(txn.id)}
                            className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className={`border-b text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'bg-slate-950/80 border-gray-800 text-gray-400' : 'bg-slate-50 border-gray-800 text-gray-400'
                }`}>
                  <tr>
                    <th className="py-4 px-4 sm:px-6">Transaction</th>
                    <th className="py-4 px-4">Date &amp; Service</th>
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
                      <td colSpan={7} className="py-12 text-center text-gray-400">
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
                          <td className="py-4 px-4 sm:px-6 font-mono font-bold">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span className="text-[#2A835F] hover:underline cursor-pointer" onClick={() => setInspectTxn(txn)}>
                                {txn.transactionNumber}
                              </span>
                            </div>
                            <div className="text-[11px] font-normal text-gray-400 mt-0.5">
                              {txn.category.replace(/_/g, ' ')}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-semibold">{txn.dateString}</div>
                            <div className="text-xs text-gray-400 truncate max-w-[180px]">
                              {txn.serviceType || 'General Overhead'}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-200 dark:text-slate-200">
                              {txn.customerName || txn.vendorName || 'Direct Cash Transaction'}
                            </div>
                            {txn.enquiry && (
                              <div className="text-[11px] text-[#2A835F]">
                                Ticket: {txn.enquiry.trackingNumber}
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-semibold">{txn.paymentMethod}</span>
                            {txn.referenceNumber && (
                              <div className="text-[11px] font-mono text-gray-400 truncate max-w-[120px]">
                                {txn.referenceNumber}
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <span className={`font-black text-sm sm:text-base ${
                              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}>
                              {isIncome ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                            </span>
                          </td>

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

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {txn.status === 'PENDING' && (
                                <button
                                  onClick={() => handleVerify(txn.id, 'VERIFIED')}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                                  title="Approve &amp; Verify"
                                >
                                  <Check className="w-4 h-4 stroke-[2.5]" />
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEdit(txn)}
                                className="p-1.5 rounded-lg hover:bg-[#2A835F]/15 text-gray-400 hover:text-emerald-400 transition-colors"
                                title="Edit Entry"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setInspectTxn(txn)}
                                className="p-1.5 rounded-lg hover:bg-slate-500/10 text-gray-400 hover:text-slate-200 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(txn.id)}
                                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition-colors"
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
          )}

        </div>
      )}

      {/* VIEW 3: ANALYTICS & INSIGHTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Service Unit Revenue Breakdown */}
            <div className={`p-6 rounded-3xl border shadow-xl ${
              isDark ? 'bg-[#14151A] border-gray-800' : 'bg-[#14151A] border-gray-800'
            }`}>
              <h3 className="text-base font-bold mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2A835F]" />
                <span>Revenue by Service Squad (വരുമാന സ്രോതസ്സുകൾ)</span>
              </h3>
              <p className={`text-xs mb-6 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
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
              isDark ? 'bg-[#14151A] border-gray-800' : 'bg-[#14151A] border-gray-800'
            }`}>
              <h3 className="text-base font-bold mb-1 flex items-center gap-2">
                <Fuel className="w-4 h-4 text-rose-500" />
                <span>Expense Breakdown by Category (ചെലവ് വിതരണം)</span>
              </h3>
              <p className={`text-xs mb-6 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
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
            isDark ? 'bg-[#14151A] text-slate-100' : 'bg-[#14151A] text-gray-200'
          }`}>
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-800 dark:border-gray-800 mb-6">
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
                  className="p-2 rounded-xl hover:bg-slate-500/10 text-gray-400 hover:text-slate-200"
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
                  <div className="text-[10px] font-bold uppercase text-gray-400">Net Day</div>
                  <div className={`text-sm sm:text-base font-black mt-1 ${
                    dayTotals.net >= 0 ? 'text-[#2A835F]' : 'text-rose-500'
                  }`}>
                    ₹{dayTotals.net.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Day Line Items List */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
                  <span>Transactions ({dayTransactions.length})</span>
                  <span>Amount</span>
                </div>

                {dayTransactions.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 text-sm">
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
                          isDark ? 'bg-slate-950/60 border-gray-800' : 'bg-slate-50 border-gray-800'
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
                        <div className="text-xs font-bold mt-1 text-gray-300 dark:text-slate-200 truncate">
                          {txn.customerName || txn.vendorName || txn.category.replace(/_/g, ' ')}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
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

      {/* CREATE / EDIT TRANSACTION MODAL WITH SHADCN DIALOG */}
      <Dialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          if (!formSubmitting) setIsCreateModalOpen(open);
        }}
      >
        <DialogContent className="w-full max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 sm:p-8 shadow-2xl border text-gray-200 relative z-50 custom-scrollbar bg-[#14151A] border-gray-800">
          {/* Top ambient brand glow */}
          <div
            className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${
              formData.type === 'INCOME' ? 'via-[#2A835F]/70' : 'via-rose-500/70'
            } to-transparent`}
          />

          <DialogHeader className="pb-4 border-b border-gray-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2A835F]">
              Financial Entry
            </span>
            <DialogTitle className="text-lg font-bold text-white mt-0.5">
              {editingTxn ? 'Edit Financial Entry' : 'Record Business Transaction'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Record or update transaction details
            </DialogDescription>
          </DialogHeader>

          {/* Error Notification */}
          {actionError && (
            <div className="p-3.5 mb-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Type Switcher */}
            <div
              className={`p-1.5 rounded-2xl border flex items-center gap-1.5 ${
                isDark ? 'bg-slate-950/80 border-gray-800' : 'bg-slate-900 border-gray-800'
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    type: 'INCOME',
                    category: 'SERVICE_PAYMENT',
                  }))
                }
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  formData.type === 'INCOME'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                <span>Cash Inflow / Income (വരവ്)</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    type: 'EXPENSE',
                    category: 'FUEL_DIESEL',
                  }))
                }
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  formData.type === 'EXPENSE'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                <span>Cash Outflow / Expense (ചെലവ്)</span>
              </button>
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
                  Amount (₹ INR) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-base">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    step="any"
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl border font-bold text-base text-white placeholder-gray-500 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] transition-all ${
                      isDark ? 'bg-slate-950 border-gray-800' : 'bg-slate-900 border-gray-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
                  Transaction Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-medium text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] transition-all ${
                    isDark ? 'bg-slate-950 border-gray-800' : 'bg-slate-900 border-gray-800'
                  }`}
                />
              </div>
            </div>

            {/* Category & Payment Method using Shadcn ComboboxDropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
                  Category <span className="text-rose-400">*</span>
                </label>
                <ComboboxDropdown
                  options={modalCategoryOptions}
                  value={formData.category}
                  onChange={(val) => setFormData({ ...formData, category: val as any })}
                  placeholder="Select category..."
                  align="start"
                  searchable
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
                  Payment Method <span className="text-rose-400">*</span>
                </label>
                <ComboboxDropdown
                  options={modalPaymentOptions}
                  value={formData.paymentMethod || 'UPI'}
                  onChange={(val) => setFormData({ ...formData, paymentMethod: val as any })}
                  placeholder="Select payment method..."
                  align="end"
                  searchable={false}
                />
              </div>
            </div>

            {/* Service Unit & Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
                  Service Squad / Operational Unit
                </label>
                <ComboboxDropdown
                  options={modalServiceOptions}
                  value={formData.serviceType || ''}
                  onChange={(val) => setFormData({ ...formData, serviceType: val })}
                  placeholder="Select service unit..."
                  align="start"
                  searchable
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
                  Reference / UPI / Voucher No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. GPay/UPI-9948201 or Bill-8492"
                  value={formData.referenceNumber || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, referenceNumber: e.target.value })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] transition-all min-h-[42px] ${
                    isDark ? 'bg-slate-950 border-gray-800' : 'bg-slate-900 border-gray-800'
                  }`}
                />
              </div>
            </div>

            {/* Party Information & Worker Association */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.type === 'INCOME' ? (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
                    Customer Name & Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Santhosh Kumar (Kanhangad)"
                    value={formData.customerName || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-medium text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] transition-all min-h-[42px] ${
                      isDark ? 'bg-slate-950 border-gray-800' : 'bg-slate-900 border-gray-800'
                    }`}
                  />
                </div>
              ) : formData.category === 'WORKER_WAGE' || formData.category === 'WORKER_BATA' ? (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
                    Assign to Worker (Disbursement)
                  </label>
                  <ComboboxDropdown
                    options={modalWorkerOptions}
                    value={formData.workerId || ''}
                    onChange={(val) => {
                      const matchedWorker = workers.find((w) => w.id === val);
                      setFormData({
                        ...formData,
                        workerId: val || undefined,
                        vendorName: matchedWorker
                          ? matchedWorker.name || matchedWorker.username || ''
                          : formData.vendorName,
                      });
                    }}
                    placeholder="Assign to worker..."
                    align="start"
                    searchable
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
                    Vendor / Payee / Supplier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HP Fuel Station Nileshwar or UltraTech Bunk"
                    value={formData.vendorName || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, vendorName: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-medium text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] transition-all min-h-[42px] ${
                      isDark ? 'bg-slate-950 border-gray-800' : 'bg-slate-900 border-gray-800'
                    }`}
                  />
                </div>
              )}

              {/* Optional Link to Service Enquiry */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
                  Link to Enquiry Ticket (Optional)
                </label>
                <ComboboxDropdown
                  options={modalEnquiryOptions}
                  value={formData.enquiryId || ''}
                  onChange={(val) => setFormData({ ...formData, enquiryId: val || undefined })}
                  placeholder="Link to enquiry ticket..."
                  align="end"
                  searchable
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
                Notes & Operational Description
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 50L diesel for JCB KL-60-A-4122 or Advance 12hr earthwork..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-medium text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] resize-none transition-all ${
                  isDark ? 'bg-slate-950 border-gray-800' : 'bg-slate-900 border-gray-800'
                }`}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold text-xs shadow-lg shadow-[#2A835F]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {formSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{editingTxn ? 'Update Entry' : 'Record Transaction'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* INSPECT TRANSACTION MODAL WITH SHADCN DIALOG */}
      <Dialog open={!!inspectTxn} onOpenChange={(open) => !open && setInspectTxn(null)}>
        {inspectTxn && (
          <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 sm:p-8 shadow-2xl border text-gray-200 bg-[#14151A] border-gray-800">
            <DialogHeader className="pb-4 border-b border-gray-800 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2A835F]">
                Transaction Voucher
              </span>
              <DialogTitle className="text-xl font-mono font-black mt-0.5 text-white">
                {inspectTxn.transactionNumber}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Transaction details and verification actions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-500/10">
                <div>
                  <div className="text-xs text-gray-400 uppercase font-bold">Amount</div>
                  <div className={`text-2xl font-black mt-0.5 ${
                    inspectTxn.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {inspectTxn.type === 'INCOME' ? '+' : '-'}₹{inspectTxn.amount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 uppercase font-bold">Status</div>
                  <div className="font-bold text-sm mt-0.5">{inspectTxn.status}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 uppercase text-[11px] font-bold">Type & Category</div>
                  <div className="font-semibold mt-0.5">{inspectTxn.type} • {inspectTxn.category.replace(/_/g, ' ')}</div>
                </div>
                <div>
                  <div className="text-gray-400 uppercase text-[11px] font-bold">Date</div>
                  <div className="font-semibold mt-0.5">{inspectTxn.dateString}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 uppercase text-[11px] font-bold">Party / Payee</div>
                  <div className="font-semibold mt-0.5">{inspectTxn.customerName || inspectTxn.vendorName || 'Direct'}</div>
                </div>
                <div>
                  <div className="text-gray-400 uppercase text-[11px] font-bold">Payment Method</div>
                  <div className="font-semibold mt-0.5">{inspectTxn.paymentMethod} {inspectTxn.referenceNumber ? `(${inspectTxn.referenceNumber})` : ''}</div>
                </div>
              </div>

              <div>
                <div className="text-gray-400 uppercase text-[11px] font-bold">Service Squad</div>
                <div className="font-semibold mt-0.5">{inspectTxn.serviceType || 'General Operations'}</div>
              </div>

              {inspectTxn.notes && (
                <div className="p-3.5 rounded-xl bg-slate-500/5 border border-gray-800 dark:border-gray-800">
                  <div className="text-gray-400 uppercase text-[10px] font-bold">Notes</div>
                  <div className="mt-1 text-gray-300 dark:text-gray-300">{inspectTxn.notes}</div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800 dark:border-gray-800">
                <span>Recorded by: <strong>{inspectTxn.recordedBy?.name || inspectTxn.recordedBy?.username || 'Staff'}</strong></span>
                <span>Role: <strong>{inspectTxn.recordedBy?.role}</strong></span>
              </div>

              {/* Action Buttons in Inspect */}
              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(inspectTxn)}
                  className="px-4 py-2 rounded-xl bg-[#1A1C23] hover:bg-[#252834] text-gray-200 hover:text-white border border-gray-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                  <span>Edit</span>
                </button>
                {inspectTxn.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleVerify(inspectTxn.id, 'REJECTED')}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 font-bold text-xs hover:bg-rose-500/20 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerify(inspectTxn.id, 'VERIFIED')}
                      className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
                    >
                      Approve & Verify
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(inspectTxn.id)}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 font-bold text-xs hover:bg-rose-500/20 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Financial Record Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTxnTarget}
        onClose={() => setDeleteTxnTarget(null)}
        onConfirm={confirmDeleteTransaction}
        title="Delete Financial Transaction"
        message="Are you sure you want to permanently delete this financial transaction record? This action will adjust financial ledgers and is logged to administrator audit trails."
        confirmText="Delete Record"
        variant="danger"
        isLoading={isDeletingTxn}
        itemDetails={
          deleteTxnTarget
            ? [
                { label: 'Ref #', value: deleteTxnTarget.transactionNumber },
                { label: 'Type', value: deleteTxnTarget.type },
                { label: 'Category', value: deleteTxnTarget.category.replace(/_/g, ' ') },
                { label: 'Amount', value: `₹${Number(deleteTxnTarget.amount).toLocaleString('en-IN')}` },
                { label: 'Date', value: deleteTxnTarget.dateString },
              ]
            : undefined
        }
      />

    </div>
  );
}
