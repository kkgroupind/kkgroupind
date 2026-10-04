export type PeriodFilter = '1_MONTH' | '3_MONTHS' | '1_YEAR' | 'CUSTOM' | 'ALL';

export interface StatementCustomerInfo {
  id: string;
  name: string;
  username: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt?: string;
}

export interface StatementEnquiryItem {
  id: string;
  trackingNumber: string;
  serviceName: string;
  serviceCategory?: string;
  date: string;
  rawDate: string | Date;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'CANCELLED' | string;
  location?: string;
  workerName?: string;
  workerPhone?: string;
  completedUnits?: string;
  workDuration?: string;
  amount: number;
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'PENDING';
  paymentMethod?: string;
  message?: string;
}

export interface StatementTransactionItem {
  id: string;
  date: string;
  amount: number;
  paymentMethod: string;
  transactionRef?: string;
  status: string;
  notes?: string;
}

export interface StatementStats {
  totalEnquiries: number;
  completedWorks: number;
  inProgressWorks: number;
  pendingWorks: number;
  cancelledWorks: number;
  totalBilledAmount: number;
  totalPaidAmount: number;
  outstandingBalance: number;
  totalWorkDurationMinutes: number;
}

export interface CustomerStatementData {
  statementRef: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  generatedBy: string;
  customer: StatementCustomerInfo;
  stats: StatementStats;
  enquiries: StatementEnquiryItem[];
  transactions: StatementTransactionItem[];
  notes?: string;
  filterType: PeriodFilter;
  onlyCompleted: boolean;
  showTransactions: boolean;
}
