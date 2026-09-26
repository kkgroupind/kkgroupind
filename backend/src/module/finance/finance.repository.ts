import { Injectable } from '@nestjs/common';
import {
  FinancialStatus,
  FinancialTransaction,
  PaymentMethod,
  PrismaService,
  TransactionCategory,
  TransactionType,
} from '../../database';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class FinanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async generateTransactionNumber(dateStr: string): Promise<string> {
    const cleanDate = dateStr.replace(/-/g, '');
    const prefix = `TXN-${cleanDate}-`;
    const count = await this.prisma.financialTransaction.count({
      where: {
        transactionNumber: {
          startsWith: prefix,
        },
      },
    });
    const suffix = (count + 1).toString().padStart(4, '0');
    return `${prefix}${suffix}`;
  }

  async create(data: {
    transactionNumber: string;
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    date: Date;
    dateString: string;
    paymentMethod: PaymentMethod;
    status: FinancialStatus;
    referenceNumber?: string;
    serviceType?: string;
    customerName?: string;
    vendorName?: string;
    notes?: string;
    receiptUrl?: string;
    enquiryId?: string;
    workerId?: string;
    recordedById: string;
    verifiedById?: string;
  }): Promise<FinancialTransaction> {
    return this.prisma.financialTransaction.create({
      data: {
        transactionNumber: data.transactionNumber,
        type: data.type,
        category: data.category,
        amount: data.amount,
        date: data.date,
        dateString: data.dateString,
        paymentMethod: data.paymentMethod,
        status: data.status,
        referenceNumber: data.referenceNumber,
        serviceType: data.serviceType,
        customerName: data.customerName,
        vendorName: data.vendorName,
        notes: data.notes,
        receiptUrl: data.receiptUrl,
        enquiryId: data.enquiryId,
        workerId: data.workerId,
        recordedById: data.recordedById,
        verifiedById: data.verifiedById,
      },
      include: {
        recordedBy: {
          select: { id: true, name: true, username: true, role: true, avatar: true },
        },
        verifiedBy: {
          select: { id: true, name: true, username: true, role: true },
        },
        enquiry: {
          select: {
            id: true,
            trackingNumber: true,
            serviceName: true,
            customerName: true,
            customerPhone: true,
            status: true,
          },
        },
        worker: {
          select: { id: true, name: true, username: true, phone: true },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.financialTransaction.findUnique({
      where: { id },
      include: {
        recordedBy: {
          select: { id: true, name: true, username: true, role: true, avatar: true },
        },
        verifiedBy: {
          select: { id: true, name: true, username: true, role: true },
        },
        enquiry: {
          select: {
            id: true,
            trackingNumber: true,
            serviceName: true,
            customerName: true,
            customerPhone: true,
            status: true,
            district: true,
          },
        },
        worker: {
          select: { id: true, name: true, username: true, phone: true },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.financialTransaction.update({
      where: { id },
      data,
      include: {
        recordedBy: {
          select: { id: true, name: true, username: true, role: true, avatar: true },
        },
        verifiedBy: {
          select: { id: true, name: true, username: true, role: true },
        },
        enquiry: {
          select: {
            id: true,
            trackingNumber: true,
            serviceName: true,
            customerName: true,
            customerPhone: true,
            status: true,
          },
        },
        worker: {
          select: { id: true, name: true, username: true, phone: true },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.financialTransaction.delete({
      where: { id },
    });
  }

  async findFiltered(params: QueryTransactionDto) {
    const {
      date,
      month,
      startDate,
      endDate,
      type,
      category,
      status,
      paymentMethod,
      serviceType,
      enquiryId,
      workerId,
      recordedById,
      search,
      page = 1,
      limit = 25,
    } = params;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (date) {
      where.dateString = date;
    } else if (month) {
      where.dateString = { startsWith: month };
    } else if (startDate || endDate) {
      where.dateString = {};
      if (startDate) where.dateString.gte = startDate;
      if (endDate) where.dateString.lte = endDate;
    }

    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (serviceType) where.serviceType = { contains: serviceType, mode: 'insensitive' };
    if (enquiryId) where.enquiryId = enquiryId;
    if (workerId) where.workerId = workerId;
    if (recordedById) where.recordedById = recordedById;

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { transactionNumber: { contains: q, mode: 'insensitive' } },
        { referenceNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { vendorName: { contains: q, mode: 'insensitive' } },
        { notes: { contains: q, mode: 'insensitive' } },
        { serviceType: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.financialTransaction.findMany({
        where,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
        include: {
          recordedBy: {
            select: { id: true, name: true, username: true, role: true, avatar: true },
          },
          verifiedBy: {
            select: { id: true, name: true, username: true, role: true },
          },
          enquiry: {
            select: {
              id: true,
              trackingNumber: true,
              serviceName: true,
              customerName: true,
              customerPhone: true,
              status: true,
            },
          },
          worker: {
            select: { id: true, name: true, username: true, phone: true },
          },
        },
      }),
      this.prisma.financialTransaction.count({ where }),
    ]);

    return { items, total };
  }

  async getSummary(params: {
    month?: string;
    startDate?: string;
    endDate?: string;
    serviceType?: string;
    todayDateStr: string;
  }) {
    const where: any = {};

    if (params.month) {
      where.dateString = { startsWith: params.month };
    } else if (params.startDate || params.endDate) {
      where.dateString = {};
      if (params.startDate) where.dateString.gte = params.startDate;
      if (params.endDate) where.dateString.lte = params.endDate;
    }

    if (params.serviceType) {
      where.serviceType = { contains: params.serviceType, mode: 'insensitive' };
    }

    // Fetch transactions matching criteria
    const transactions = await this.prisma.financialTransaction.findMany({
      where,
      select: {
        type: true,
        category: true,
        amount: true,
        status: true,
        paymentMethod: true,
        serviceType: true,
        dateString: true,
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let pendingVerificationCount = 0;
    let pendingVerificationAmount = 0;
    let todayIncome = 0;
    let todayExpense = 0;

    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};
    const incomeByServiceType: Record<string, number> = {};
    const paymentMethodBreakdown: Record<string, number> = {};

    for (const t of transactions) {
      const amt = Number(t.amount);

      if (t.status === FinancialStatus.PENDING) {
        pendingVerificationCount++;
        pendingVerificationAmount += amt;
      }

      if (t.dateString === params.todayDateStr) {
        if (t.type === TransactionType.INCOME) {
          todayIncome += amt;
        } else {
          todayExpense += amt;
        }
      }

      if (t.type === TransactionType.INCOME) {
        totalIncome += amt;
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + amt;
        if (t.serviceType) {
          incomeByServiceType[t.serviceType] =
            (incomeByServiceType[t.serviceType] || 0) + amt;
        }
      } else {
        totalExpense += amt;
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + amt;
      }

      paymentMethodBreakdown[t.paymentMethod] =
        (paymentMethodBreakdown[t.paymentMethod] || 0) + amt;
    }

    const netProfit = totalIncome - totalExpense;
    const profitMargin =
      totalIncome > 0 ? Number(((netProfit / totalIncome) * 100).toFixed(2)) : 0;

    return {
      totalIncome,
      totalExpense,
      netProfit,
      profitMargin,
      pendingVerificationCount,
      pendingVerificationAmount,
      todayIncome,
      todayExpense,
      todayNet: todayIncome - todayExpense,
      totalTransactions: transactions.length,
      incomeByCategory,
      expenseByCategory,
      incomeByServiceType,
      paymentMethodBreakdown,
    };
  }

  async getCalendarFeed(monthStr: string) {
    // Find all transactions for this month prefix (e.g. "2026-09")
    const transactions = await this.prisma.financialTransaction.findMany({
      where: {
        dateString: {
          startsWith: monthStr,
        },
      },
      select: {
        dateString: true,
        type: true,
        amount: true,
        status: true,
      },
    });

    const dailyMap: Record<
      string,
      {
        date: string;
        totalIncome: number;
        totalExpense: number;
        netAmount: number;
        count: number;
        hasPending: boolean;
      }
    > = {};

    for (const t of transactions) {
      if (!dailyMap[t.dateString]) {
        dailyMap[t.dateString] = {
          date: t.dateString,
          totalIncome: 0,
          totalExpense: 0,
          netAmount: 0,
          count: 0,
          hasPending: false,
        };
      }

      const day = dailyMap[t.dateString];
      day.count++;
      const amt = Number(t.amount);

      if (t.type === TransactionType.INCOME) {
        day.totalIncome += amt;
      } else {
        day.totalExpense += amt;
      }
      day.netAmount = day.totalIncome - day.totalExpense;

      if (t.status === FinancialStatus.PENDING) {
        day.hasPending = true;
      }
    }

    return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  }
}
