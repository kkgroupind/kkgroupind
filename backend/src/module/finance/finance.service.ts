import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FinanceRepository } from './finance.repository';
import { AuditService } from '../audit/audit.service';
import {
  CreateTransactionDto,
  QueryTransactionDto,
  UpdateTransactionDto,
  VerifyTransactionDto,
} from './dto';
import { FinancialStatus, Role } from '../../database';
import { FINANCE_MESSAGES } from '../../common';

@Injectable()
export class FinanceService {
  constructor(
    private readonly financeRepo: FinanceRepository,
    private readonly auditService: AuditService,
  ) {}

  private getTodayDateString(): string {
    const now = new Date();
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
    }).format(now);
  }

  async createTransaction(user: any, dto: CreateTransactionDto, ipAddress?: string) {
    const dateObj = new Date(dto.date);
    const dateString = dto.date;

    const transactionNumber =
      await this.financeRepo.generateTransactionNumber(dateString);

    const isSuperAdmin = user.role === Role.SUPER_ADMIN;
    const initialStatus = isSuperAdmin
      ? FinancialStatus.VERIFIED
      : FinancialStatus.PENDING;
    const verifiedById = isSuperAdmin ? user.id : undefined;

    const transaction = await this.financeRepo.create({
      transactionNumber,
      type: dto.type,
      category: dto.category,
      amount: dto.amount,
      date: dateObj,
      dateString,
      paymentMethod: dto.paymentMethod || ('CASH' as any),
      status: initialStatus,
      referenceNumber: dto.referenceNumber,
      serviceType: dto.serviceType,
      customerName: dto.customerName,
      vendorName: dto.vendorName,
      notes: dto.notes,
      receiptUrl: dto.receiptUrl,
      enquiryId: dto.enquiryId,
      workerId: dto.workerId,
      recordedById: user.id,
      verifiedById,
    });

    // Record Audit Log
    await this.auditService.recordLog({
      userId: user.id,
      userName: user.name || user.username,
      userEmail: user.email,
      userRole: user.role,
      action: 'CREATE_FINANCE_TRANSACTION',
      entityType: 'FINANCE',
      entityId: transaction.id,
      details: {
        transactionNumber,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        date: transaction.dateString,
        paymentMethod: transaction.paymentMethod,
        status: transaction.status,
      },
      ipAddress,
    });

    return {
      message: FINANCE_MESSAGES.TRANSACTION_CREATED_SUCCESS,
      transaction,
    };
  }

  async updateTransaction(
    id: string,
    user: any,
    dto: UpdateTransactionDto,
    ipAddress?: string,
  ) {
    const existing = await this.financeRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(FINANCE_MESSAGES.TRANSACTION_NOT_FOUND);
    }

    if (user.role === Role.OFFICE_STAFF) {
      if (existing.status === FinancialStatus.VERIFIED) {
        throw new ForbiddenException(FINANCE_MESSAGES.CANNOT_EDIT_VERIFIED);
      }
      if (existing.recordedById !== user.id) {
        throw new ForbiddenException('You can only edit transactions recorded by yourself');
      }
    }

    const updatePayload: any = {};
    if (dto.type) updatePayload.type = dto.type;
    if (dto.category) updatePayload.category = dto.category;
    if (dto.amount !== undefined) updatePayload.amount = dto.amount;
    if (dto.date) {
      updatePayload.date = new Date(dto.date);
      updatePayload.dateString = dto.date;
    }
    if (dto.paymentMethod) updatePayload.paymentMethod = dto.paymentMethod;
    if (dto.referenceNumber !== undefined)
      updatePayload.referenceNumber = dto.referenceNumber;
    if (dto.serviceType !== undefined) updatePayload.serviceType = dto.serviceType;
    if (dto.customerName !== undefined) updatePayload.customerName = dto.customerName;
    if (dto.vendorName !== undefined) updatePayload.vendorName = dto.vendorName;
    if (dto.notes !== undefined) updatePayload.notes = dto.notes;
    if (dto.receiptUrl !== undefined) updatePayload.receiptUrl = dto.receiptUrl;
    if (dto.enquiryId !== undefined) updatePayload.enquiryId = dto.enquiryId;
    if (dto.workerId !== undefined) updatePayload.workerId = dto.workerId;

    const updated = await this.financeRepo.update(id, updatePayload);

    await this.auditService.recordLog({
      userId: user.id,
      userName: user.name || user.username,
      userEmail: user.email,
      userRole: user.role,
      action: 'UPDATE_FINANCE_TRANSACTION',
      entityType: 'FINANCE',
      entityId: id,
      details: {
        transactionNumber: existing.transactionNumber,
        changes: updatePayload,
      },
      ipAddress,
    });

    return {
      message: FINANCE_MESSAGES.TRANSACTION_UPDATED_SUCCESS,
      transaction: updated,
    };
  }

  async verifyTransaction(
    id: string,
    adminUser: any,
    dto: VerifyTransactionDto,
    ipAddress?: string,
  ) {
    const existing = await this.financeRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(FINANCE_MESSAGES.TRANSACTION_NOT_FOUND);
    }

    const updated = await this.financeRepo.update(id, {
      status: dto.status,
      verifiedById: adminUser.id,
      notes: dto.notes ? `${existing.notes || ''} | Verification Note: ${dto.notes}` : existing.notes,
    });

    const isApproved = dto.status === FinancialStatus.VERIFIED;

    await this.auditService.recordLog({
      userId: adminUser.id,
      userName: adminUser.name || adminUser.username,
      userEmail: adminUser.email,
      userRole: adminUser.role,
      action: isApproved
        ? 'VERIFY_FINANCE_TRANSACTION'
        : 'REJECT_FINANCE_TRANSACTION',
      entityType: 'FINANCE',
      entityId: id,
      details: {
        transactionNumber: existing.transactionNumber,
        newStatus: dto.status,
        previousStatus: existing.status,
        notes: dto.notes,
      },
      ipAddress,
    });

    return {
      message: isApproved
        ? FINANCE_MESSAGES.TRANSACTION_VERIFIED_SUCCESS
        : FINANCE_MESSAGES.TRANSACTION_REJECTED_SUCCESS,
      transaction: updated,
    };
  }

  async deleteTransaction(id: string, adminUser: any, ipAddress?: string) {
    const existing = await this.financeRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(FINANCE_MESSAGES.TRANSACTION_NOT_FOUND);
    }

    await this.financeRepo.delete(id);

    await this.auditService.recordLog({
      userId: adminUser.id,
      userName: adminUser.name || adminUser.username,
      userEmail: adminUser.email,
      userRole: adminUser.role,
      action: 'DELETE_FINANCE_TRANSACTION',
      entityType: 'FINANCE',
      entityId: id,
      details: {
        transactionNumber: existing.transactionNumber,
        amount: existing.amount,
        type: existing.type,
        category: existing.category,
      },
      ipAddress,
    });

    return {
      message: FINANCE_MESSAGES.TRANSACTION_DELETED_SUCCESS,
    };
  }

  async getTransactions(query: QueryTransactionDto) {
    const { items, total } = await this.financeRepo.findFiltered(query);
    const limit = Number(query.limit || 25);
    const page = Number(query.page || 1);

    return {
      message: FINANCE_MESSAGES.TRANSACTIONS_FETCHED_SUCCESS,
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getTransactionById(id: string) {
    const transaction = await this.financeRepo.findById(id);
    if (!transaction) {
      throw new NotFoundException(FINANCE_MESSAGES.TRANSACTION_NOT_FOUND);
    }
    return transaction;
  }

  async getSummary(query: {
    month?: string;
    startDate?: string;
    endDate?: string;
    serviceType?: string;
  }) {
    const todayDateStr = this.getTodayDateString();
    const summary = await this.financeRepo.getSummary({
      ...query,
      todayDateStr,
    });

    return {
      message: FINANCE_MESSAGES.SUMMARY_FETCHED_SUCCESS,
      todayDate: todayDateStr,
      ...summary,
    };
  }

  async getCalendarFeed(month?: string) {
    const targetMonth =
      month || this.getTodayDateString().substring(0, 7); // e.g. "2026-09"
    const days = await this.financeRepo.getCalendarFeed(targetMonth);

    return {
      message: FINANCE_MESSAGES.CALENDAR_FETCHED_SUCCESS,
      month: targetMonth,
      days,
    };
  }
}
