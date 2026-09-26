import { request } from './api-client';

export type TransactionType = 'INCOME' | 'EXPENSE';

export type TransactionCategory =
  | 'SERVICE_PAYMENT'
  | 'ADVANCE_PAYMENT'
  | 'MILESTONE_PAYMENT'
  | 'FINAL_SETTLEMENT'
  | 'FUEL_DIESEL'
  | 'WORKER_WAGE'
  | 'WORKER_BATA'
  | 'MATERIAL_PURCHASE'
  | 'EQUIPMENT_REPAIR'
  | 'OFFICE_EXPENSE'
  | 'TRANSPORT_TRAVEL'
  | 'OTHER';

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';

export type FinancialStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface FinancialTransaction {
  id: string;
  transactionNumber: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  date: string;
  dateString: string;
  paymentMethod: PaymentMethod;
  status: FinancialStatus;
  referenceNumber?: string | null;
  serviceType?: string | null;
  customerName?: string | null;
  vendorName?: string | null;
  notes?: string | null;
  receiptUrl?: string | null;
  enquiryId?: string | null;
  workerId?: string | null;
  recordedById: string;
  verifiedById?: string | null;
  createdAt: string;
  updatedAt: string;
  recordedBy?: {
    id: string;
    name?: string | null;
    username?: string | null;
    role: string;
    avatar?: string | null;
  };
  verifiedBy?: {
    id: string;
    name?: string | null;
    username?: string | null;
    role: string;
  } | null;
  enquiry?: {
    id: string;
    trackingNumber: string;
    serviceName: string;
    customerName: string;
    customerPhone: string;
    status: string;
    district?: string;
  } | null;
  worker?: {
    id: string;
    name?: string | null;
    username?: string | null;
    phone?: string | null;
  } | null;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  pendingVerificationCount: number;
  pendingVerificationAmount: number;
  todayIncome: number;
  todayExpense: number;
  todayNet: number;
  totalTransactions: number;
  todayDate: string;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  incomeByServiceType: Record<string, number>;
  paymentMethodBreakdown: Record<string, number>;
}

export interface CalendarDayFinance {
  date: string; // YYYY-MM-DD
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  count: number;
  hasPending: boolean;
}

export interface TransactionFilterParams {
  date?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  category?: TransactionCategory;
  status?: FinancialStatus;
  paymentMethod?: PaymentMethod;
  serviceType?: string;
  enquiryId?: string;
  workerId?: string;
  recordedById?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  serviceType?: string;
  customerName?: string;
  vendorName?: string;
  notes?: string;
  receiptUrl?: string;
  enquiryId?: string;
  workerId?: string;
}

export interface UpdateTransactionPayload {
  type?: TransactionType;
  category?: TransactionCategory;
  amount?: number;
  date?: string;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  serviceType?: string;
  customerName?: string;
  vendorName?: string;
  notes?: string;
  receiptUrl?: string;
  enquiryId?: string;
  workerId?: string;
}

export interface VerifyTransactionPayload {
  status: FinancialStatus;
  notes?: string;
}

export const FinanceService = {
  async getSummary(
    token?: string | null,
    params?: {
      month?: string;
      startDate?: string;
      endDate?: string;
      serviceType?: string;
    },
  ): Promise<FinancialSummary> {
    const query = new URLSearchParams();
    if (params?.month) query.set('month', params.month);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.serviceType) query.set('serviceType', params.serviceType);

    const queryString = query.toString();
    const endpoint = `/finance/summary${queryString ? `?${queryString}` : ''}`;
    return request<FinancialSummary>(endpoint, { method: 'GET' }, token);
  },

  async getCalendarFeed(
    token?: string | null,
    month?: string,
  ): Promise<{ month: string; days: CalendarDayFinance[] }> {
    const query = month ? `?month=${encodeURIComponent(month)}` : '';
    return request<{ month: string; days: CalendarDayFinance[] }>(
      `/finance/calendar${query}`,
      { method: 'GET' },
      token,
    );
  },

  async getTransactions(
    token?: string | null,
    params: TransactionFilterParams = {},
  ): Promise<{
    items: FinancialTransaction[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.set(key, String(val));
      }
    });

    const queryString = query.toString();
    const endpoint = `/finance/transactions${queryString ? `?${queryString}` : ''}`;
    return request<{
      items: FinancialTransaction[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(endpoint, { method: 'GET' }, token);
  },

  async getTransactionById(
    token: string | null | undefined,
    id: string,
  ): Promise<FinancialTransaction> {
    return request<FinancialTransaction>(
      `/finance/transactions/${id}`,
      { method: 'GET' },
      token,
    );
  },

  async createTransaction(
    token: string | null | undefined,
    payload: CreateTransactionPayload,
  ): Promise<{ message: string; transaction: FinancialTransaction }> {
    return request<{ message: string; transaction: FinancialTransaction }>(
      '/finance/transactions',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  async updateTransaction(
    token: string | null | undefined,
    id: string,
    payload: UpdateTransactionPayload,
  ): Promise<{ message: string; transaction: FinancialTransaction }> {
    return request<{ message: string; transaction: FinancialTransaction }>(
      `/finance/transactions/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  async verifyTransaction(
    token: string | null | undefined,
    id: string,
    payload: VerifyTransactionPayload,
  ): Promise<{ message: string; transaction: FinancialTransaction }> {
    return request<{ message: string; transaction: FinancialTransaction }>(
      `/finance/transactions/${id}/verify`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  async deleteTransaction(
    token: string | null | undefined,
    id: string,
  ): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/finance/transactions/${id}`,
      { method: 'DELETE' },
      token,
    );
  },
};
