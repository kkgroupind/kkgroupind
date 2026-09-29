import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'node:crypto';
import { EnquiryRepository } from './enquiry.repository';
import {
  CreateEnquiryDto,
  AssignWorkerDto,
  UpdateEnquiryStatusDto,
  UpdateWorkerDutyDto,
  AcceptJobDto,
  StartWorkTimerDto,
  StopWorkTimerDto,
  PauseWorkTimerDto,
  ResumeWorkTimerDto,
  SaveWorkDraftDto,
  ReachedSiteDto,
  UpdateJobPayDto,
} from './dto';
import { ENQUIRY_MESSAGES } from '../../common';
import { resolveServiceSpec } from '../../common/constants/service-specs.constant';
import { NotificationType, Role, ServiceStatus, WorkerStatus } from '../../database';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notification/notification.service';
import { FinanceService } from '../finance/finance.service';
import { TransactionType, TransactionCategory, PaymentMethod, FinancialStatus } from '../../database';

@Injectable()
export class EnquiryService {
  constructor(
    private readonly enquiryRepo: EnquiryRepository,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
    private readonly financeService: FinanceService,
  ) {}

  async createEnquiry(
    dto: CreateEnquiryDto,
    currentUser?: { id?: string; role?: Role },
  ) {
    const trackingNumber = `ENQ-${new Date().getFullYear()}-${crypto.randomInt(100000, 999999)}`;
    
    let parsedPreferredDate: Date | undefined = undefined;
    if (dto.preferredDate) {
      const candidate = new Date(dto.preferredDate);
      if (!isNaN(candidate.getTime())) {
        parsedPreferredDate = candidate;
      }
    }

    let parsedDeadline: Date | undefined = undefined;
    if (dto.deadline) {
      const candidate = new Date(dto.deadline);
      if (!isNaN(candidate.getTime())) {
        parsedDeadline = candidate;
      }
    }

    // Determine creator role and creator ID
    const createdByRole = currentUser?.role || Role.CUSTOMER;
    const createdById = currentUser?.id || undefined;
    const customerId = currentUser?.role === Role.CUSTOMER ? currentUser.id : undefined;

    // Compose formatted location summary if district and city are provided
    let locationSummary = dto.location;
    if (!locationSummary && (dto.district || dto.city)) {
      locationSummary = [dto.city, dto.district, dto.state || 'Kerala']
        .filter(Boolean)
        .join(', ');
    }

    // Resolve service wage specification dynamically from service name
    const spec = resolveServiceSpec(dto.serviceName);

    const enquiry = await this.enquiryRepo.create({
      trackingNumber,
      serviceName: dto.serviceName,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerEmail: dto.customerEmail,
      state: dto.state || 'Kerala',
      district: dto.district || 'Kasaragod',
      city: dto.city,
      location: locationSummary,
      mapUrl: dto.mapUrl,
      locationRemarks: undefined,
      preferredDate: parsedPreferredDate,
      deadline: parsedDeadline,
      message: dto.message,
      customerId,
      createdByRole,
      createdById,
      wageType: spec.wageType,
      unitLabel: spec.unitLabel,
      unitRate: undefined, // Prices set only post-completion by admin/office staff
      workerUnitWage: undefined,
      minUnits: spec.minUnits,
      isHourlyCalculated: spec.wageType === 'HOURLY',
    });

    await this.auditService.recordLog({
      userId: currentUser?.id,
      userName: dto.customerName,
      userEmail: dto.customerEmail,
      userRole: createdByRole,
      action: 'ENQUIRY_CREATED',
      entityType: 'SERVICE_ENQUIRY',
      entityId: enquiry.id,
      details: {
        trackingNumber,
        serviceName: dto.serviceName,
        district: dto.district || 'Kerala',
        customerPhone: dto.customerPhone,
        createdByRole,
      },
    });

    if (customerId) {
      await this.notificationService.notifyUser({
        userId: customerId,
        title: 'Booking Request Received',
        message: `Your booking for ${dto.serviceName} has been received (Ref: ${trackingNumber}). Our dispatch desk is assigning specialists.`,
        type: NotificationType.ENQUIRY,
        link: '/dashboard',
      });
    }

    await this.notificationService.notifyAdminsAndStaff({
      title: `New Service Enquiry: ${dto.serviceName}`,
      message: `${dto.customerName} submitted a request in ${dto.district || 'Kerala'}. Tracking #: ${trackingNumber}`,
      type: NotificationType.ENQUIRY,
      link: '/admin/operations/enquiries',
    });

    return {
      message: ENQUIRY_MESSAGES.ENQUIRY_CREATED_SUCCESS,
      enquiry,
    };
  }

  async getAllEnquiries(params: {
    status?: ServiceStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const { items, total } = await this.enquiryRepo.findAllPaginated({
      status: params.status,
      search: params.search,
      skip,
      take: limit,
    });

    return {
      message: ENQUIRY_MESSAGES.ENQUIRIES_FETCHED_SUCCESS,
      enquiries: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEnquiryById(id: string) {
    const enquiry = await this.enquiryRepo.findById(id);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }
    return enquiry;
  }

  async getActiveWorkers() {
    const workers = await this.enquiryRepo.findActiveWorkers();
    return {
      message: ENQUIRY_MESSAGES.WORKERS_FETCHED_SUCCESS,
      workers,
    };
  }

  private isWorkerAssignedToJob(enquiry: any, workerId: string): boolean {
    if (enquiry.workerId === workerId) return true;
    const squadWorkerIds = (enquiry.specificationDetails as any)?.squadWorkerIds;
    if (Array.isArray(squadWorkerIds) && squadWorkerIds.includes(workerId)) {
      return true;
    }
    return false;
  }

  async assignWorker(
    enquiryId: string,
    dto: AssignWorkerDto,
    officeStaffId: string,
  ) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }

    const primaryWorker = await this.enquiryRepo.findWorkerById(dto.workerId);
    if (!primaryWorker) {
      throw new NotFoundException(ENQUIRY_MESSAGES.WORKER_NOT_FOUND);
    }

    // STRICT RULE: Primary worker must be AVAILABLE
    if (primaryWorker.workerStatus !== WorkerStatus.AVAILABLE) {
      throw new BadRequestException(ENQUIRY_MESSAGES.CANNOT_ASSIGN_UNAVAILABLE);
    }

    // Multi-worker Squad handling
    const allWorkerIds = Array.from(
      new Set([dto.workerId, ...(dto.squadWorkerIds || [])]),
    ).filter(Boolean);

    let squadMembers: any[] = [];
    if (allWorkerIds.length > 1) {
      const workers = await this.enquiryRepo.findWorkersByIds(allWorkerIds);
      if (workers.length !== allWorkerIds.length) {
        throw new NotFoundException(ENQUIRY_MESSAGES.WORKER_NOT_FOUND);
      }
      for (const w of workers) {
        if (w.workerStatus !== WorkerStatus.AVAILABLE && w.id !== dto.workerId) {
          throw new BadRequestException(
            `Operative ${w.name || w.username || w.id} is currently unavailable for squad assignment`,
          );
        }
      }
      squadMembers = workers.map((w) => ({
        id: w.id,
        name: w.name || w.username || 'Field Operative',
        phone: w.phone || '',
        avatar: w.avatar || null,
        role: w.id === dto.workerId ? 'Squad Leader' : 'Co-Worker',
      }));
    } else {
      squadMembers = [
        {
          id: primaryWorker.id,
          name: primaryWorker.name || primaryWorker.username || 'Field Operative',
          phone: primaryWorker.phone || '',
          avatar: primaryWorker.avatar || null,
          role: 'Squad Leader',
        },
      ];
    }

    let parsedDeadline: Date | undefined = undefined;
    if (dto.deadline) {
      const candidate = new Date(dto.deadline);
      if (!isNaN(candidate.getTime())) {
        parsedDeadline = candidate;
      }
    }

    // Resolve service specification dynamically from service name
    const isMachinery = /jcb|excavat|crane|earthmov|tractor|loader|grader|റോഡ്|മണ്ണെടുക്കൽ/i.test(enquiry.serviceName);
    const explicitWageType = dto.wageType && (dto.wageType !== 'HOURLY' || isMachinery) ? dto.wageType : undefined;
    const spec = resolveServiceSpec(enquiry.serviceName, explicitWageType);
    const wageType = explicitWageType || spec.wageType;
    const unitLabel = dto.unitLabel || spec.unitLabel;
    const unitRate = dto.unitRate !== undefined ? dto.unitRate : undefined;
    const workerUnitWage = dto.workerUnitWage !== undefined ? dto.workerUnitWage : undefined;
    const minUnits = dto.minUnits !== undefined ? dto.minUnits : spec.minUnits;
    const isHourlyCalculated = wageType === 'HOURLY';

    const mergedSpecificationDetails = {
      ...(dto.specificationDetails || {}),
      isSquad: allWorkerIds.length > 1,
      squadWorkerIds: allWorkerIds,
      squadMembers,
    };

    const updated = await this.enquiryRepo.assignWorkerTransaction(
      enquiryId,
      dto.workerId,
      officeStaffId,
      {
        notes: dto.notes,
        mapUrl: dto.mapUrl,
        locationRemarks: dto.locationRemarks,
        isHourlyCalculated,
        hourlyRate: isHourlyCalculated ? unitRate : (dto.hourlyRate !== undefined ? dto.hourlyRate : undefined),
        wageType,
        unitLabel,
        unitRate,
        workerUnitWage,
        estimatedUnits: dto.estimatedUnits || minUnits,
        minUnits,
        specificationDetails: mergedSpecificationDetails,
        deadline: parsedDeadline,
        squadWorkerIds: allWorkerIds,
      },
    );

    await this.auditService.recordLog({
      userId: officeStaffId,
      action: 'WORKER_ASSIGNED',
      entityType: 'SERVICE_ENQUIRY',
      entityId: enquiryId,
      details: {
        trackingNumber: updated.trackingNumber,
        serviceName: updated.serviceName,
        workerId: dto.workerId,
        workerName: primaryWorker.name || primaryWorker.username,
        squadSize: allWorkerIds.length,
      },
    });

    // Notify all assigned workers
    for (const wId of allWorkerIds) {
      await this.notificationService.notifyUser({
        userId: wId,
        title: `New Job Assigned: ${updated.serviceName}`,
        message: `You have been allocated work order ${updated.trackingNumber} for ${updated.customerName} at ${updated.location || updated.district || 'Kerala'}.`,
        type: NotificationType.ASSIGNMENT,
        link: '/worker/jobs',
      });
    }

    // Notify customer if customer account exists
    if (updated.customerId) {
      await this.notificationService.notifyUser({
        userId: updated.customerId,
        title: 'Specialist Dispatched',
        message: `Field technician ${primaryWorker.name || 'Specialist'} has been assigned to your service order ${updated.trackingNumber}.`,
        type: NotificationType.ASSIGNMENT,
        link: '/dashboard',
      });
    }

    return {
      message: ENQUIRY_MESSAGES.ENQUIRY_ASSIGNED_SUCCESS,
      enquiry: updated,
    };
  }

  async getWorkerJobs(workerId: string, status?: ServiceStatus) {
    const jobs = await this.enquiryRepo.findJobsByWorker(workerId, status);
    return {
      jobs,
    };
  }

  async acceptWorkerJob(
    enquiryId: string,
    workerId: string,
    dto: AcceptJobDto,
  ) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }

    if (!this.isWorkerAssignedToJob(enquiry, workerId)) {
      throw new ForbiddenException(ENQUIRY_MESSAGES.NOT_ASSIGNED_TO_JOB);
    }

    const updated = await this.enquiryRepo.acceptJobTransaction(
      enquiryId,
      workerId,
      dto,
    );

    await this.auditService.recordLog({
      userId: workerId,
      userRole: Role.WORKER,
      action: 'JOB_ACCEPTED',
      entityType: 'SERVICE_ENQUIRY',
      entityId: enquiryId,
      details: {
        trackingNumber: enquiry.trackingNumber,
        serviceName: enquiry.serviceName,
        notes: dto.notes,
      },
    });

    if (enquiry.customerId) {
      await this.notificationService.notifyUser({
        userId: enquiry.customerId,
        title: 'Work Order Confirmed',
        message: `Field technician has confirmed work order ${enquiry.trackingNumber} and is preparing dispatch.`,
        type: NotificationType.ENQUIRY,
        link: '/dashboard',
      });
    }

    return {
      message: ENQUIRY_MESSAGES.JOB_ACCEPTED_SUCCESS,
      enquiry: updated,
    };
  }

  async markReachedSite(
    enquiryId: string,
    workerId: string,
    dto?: ReachedSiteDto,
  ) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }

    if (!this.isWorkerAssignedToJob(enquiry, workerId)) {
      throw new ForbiddenException(ENQUIRY_MESSAGES.NOT_ASSIGNED_TO_JOB);
    }

    const updated = await this.enquiryRepo.markReachedSiteTransaction(
      enquiryId,
      workerId,
      dto,
    );

    return {
      message: ENQUIRY_MESSAGES.REACHED_SITE_SUCCESS,
      enquiry: updated,
    };
  }

  async updateJobPay(enquiryId: string, dto: UpdateJobPayDto, recordedById: string) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }

    const isModifyingWork =
      dto.completedUnits !== undefined ||
      dto.workDurationMinutes !== undefined ||
      dto.status !== undefined ||
      dto.unitLabel !== undefined ||
      dto.notes !== undefined ||
      dto.unitRate !== undefined ||
      dto.workerUnitWage !== undefined;

    if (!isModifyingWork && enquiry.status !== ServiceStatus.COMPLETED) {
      throw new BadRequestException(
        ENQUIRY_MESSAGES.PAYMENT_ONLY_AFTER_COMPLETION,
      );
    }

    const currentSpec = (enquiry.specificationDetails as any) || {};
    const effectiveBreakMins =
      dto.totalBreakMinutes !== undefined
        ? dto.totalBreakMinutes
        : (currentSpec.totalBreakMinutes || 0);
    const effectiveWorkMins =
      dto.workDurationMinutes !== undefined
        ? dto.workDurationMinutes
        : (currentSpec.actualWorkMinutes || enquiry.workDurationMinutes || 0);
    const grossMinutes = effectiveWorkMins + effectiveBreakMins;

    const updatedSpec = {
      ...currentSpec,
      paymentMode: dto.paymentMode || currentSpec.paymentMode,
      paymentRef: dto.paymentRef || currentSpec.paymentRef,
      paymentAssignedAt: new Date().toISOString(),
      ...(dto.totalBreakMinutes !== undefined
        ? {
            totalBreakMinutes: dto.totalBreakMinutes,
            totalBreakSeconds: dto.totalBreakMinutes * 60,
          }
        : {}),
      ...(dto.workDurationMinutes !== undefined
        ? {
            actualWorkMinutes: dto.workDurationMinutes,
            actualWorkSeconds: dto.workDurationMinutes * 60,
          }
        : {}),
      grossDurationMinutes: grossMinutes,
      grossDurationSeconds: grossMinutes * 60,
    };

    const updated = await this.enquiryRepo.updateJobPayTransaction(
      enquiryId,
      {
        ...dto,
        specificationDetails: updatedSpec,
      },
    );

    // AUTO FEED FINANCES
    try {
      const mockUser = { id: recordedById, role: Role.OFFICE_STAFF }; // For createTransaction authorization
      const today = new Date().toISOString().split('T')[0];

      // Income (Customer Payment)
      if (dto.totalCalculatedCost && dto.totalCalculatedCost > 0) {
        await this.financeService.createTransaction(mockUser as any, {
          type: TransactionType.INCOME,
          category: TransactionCategory.SERVICE_PAYMENT,
          amount: dto.totalCalculatedCost,
          date: today,
          paymentMethod: dto.paymentMode as any || PaymentMethod.CASH,
          serviceType: updated.serviceName,
          customerName: updated.customerName,
          notes: `Auto-generated revenue for completed work order: ${updated.trackingNumber}`,
          enquiryId: updated.id,
          referenceNumber: dto.paymentRef,
        });
      }

      // Expense (Worker Wage)
      if (dto.totalCalculatedWage && dto.totalCalculatedWage > 0 && updated.workerId) {
        await this.financeService.createTransaction(mockUser as any, {
          type: TransactionType.EXPENSE,
          category: TransactionCategory.WORKER_WAGE,
          amount: dto.totalCalculatedWage,
          date: today,
          paymentMethod: dto.paymentMode as any || PaymentMethod.CASH,
          serviceType: updated.serviceName,
          workerId: updated.workerId,
          notes: `Auto-generated worker wage payout for: ${updated.trackingNumber}`,
          enquiryId: updated.id,
          referenceNumber: dto.paymentRef,
        });
      }
    } catch (e) {
      console.error('Failed to auto-feed finances', e);
    }

    // Non-blocking notification to assigned worker
    if (updated.workerId) {
      this.notificationService
        .notifyUser({
          userId: updated.workerId,
          title: `Payout Finalized: ₹${updated.totalCalculatedWage || 0}`,
          message: `Your payment of ₹${updated.totalCalculatedWage || 0} for work order "${updated.serviceName}" (${updated.trackingNumber}) has been updated. Mode: ${dto.paymentMode || 'CASH'}.`,
          type: NotificationType.FINANCE,
          link: '/worker/notifications',
          metadata: {
            enquiryId,
            trackingNumber: updated.trackingNumber,
            totalCalculatedWage: updated.totalCalculatedWage,
            paymentMode: dto.paymentMode,
          },
        })
        .catch(() => {});
    }

    // Non-blocking immutable audit log
    this.auditService
      .recordLog({
        action: 'WORKER_PAYOUT_ASSIGNED',
        entityType: 'SERVICE_ENQUIRY',
        entityId: enquiryId,
        details: JSON.stringify({
          trackingNumber: updated.trackingNumber,
          workerId: updated.workerId,
          totalCalculatedWage: updated.totalCalculatedWage,
          workerUnitWage: updated.workerUnitWage,
          completedUnits: updated.completedUnits,
          paymentMode: dto.paymentMode,
          notes: dto.notes,
        }),
      })
      .catch(() => {});

    return {
      message: ENQUIRY_MESSAGES.PAY_UPDATED_SUCCESS,
      enquiry: updated,
    };
  }

  async confirmPaymentReceived(enquiryId: string, workerId: string) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }
    if (enquiry.workerId !== workerId) {
      throw new ForbiddenException('Not assigned to this job');
    }
    if (!enquiry.totalCalculatedWage) {
      throw new BadRequestException('Payment has not been finalized by office yet');
    }

    const currentSpec = (enquiry.specificationDetails as any) || {};
    
    if (currentSpec.paymentReceivedAt) {
      throw new BadRequestException('Payment already marked as received');
    }

    const updatedSpec = {
      ...currentSpec,
      paymentReceivedAt: new Date().toISOString(),
      paymentReceivedBy: workerId,
    };

    const updated = await this.enquiryRepo.saveDraftTransaction(enquiryId, {
      specificationDetails: updatedSpec,
    });

    this.auditService.recordLog({
      action: 'WORKER_PAYMENT_RECEIVED',
      entityType: 'SERVICE_ENQUIRY',
      entityId: enquiryId,
      details: JSON.stringify({
        workerId,
        amount: enquiry.totalCalculatedWage,
      }),
    }).catch(() => {});

    return {
      message: 'Payment receipt confirmed successfully',
      enquiry: updated,
    };
  }

  async startWorkTimer(
    enquiryId: string,
    workerId: string,
    dto: StartWorkTimerDto,
    userRole?: Role,
  ) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }

    const isAdminOrStaff = userRole === Role.SUPER_ADMIN || userRole === Role.OFFICE_STAFF;
    if (!isAdminOrStaff && !this.isWorkerAssignedToJob(enquiry, workerId)) {
      throw new ForbiddenException(ENQUIRY_MESSAGES.NOT_ASSIGNED_TO_JOB);
    }

    const effectiveWorkerId = enquiry.workerId || workerId;

    const updated = await this.enquiryRepo.startWorkTimerTransaction(
      enquiryId,
      effectiveWorkerId,
      dto,
    );

    return {
      message: ENQUIRY_MESSAGES.WORK_TIMER_STARTED,
      enquiry: updated,
    };
  }

  async pauseWorkTimer(
    enquiryId: string,
    workerId: string,
    dto: PauseWorkTimerDto,
    userRole?: Role,
  ) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }

    const isAdminOrStaff = userRole === Role.SUPER_ADMIN || userRole === Role.OFFICE_STAFF;
    if (!isAdminOrStaff && !this.isWorkerAssignedToJob(enquiry, workerId)) {
      throw new ForbiddenException(ENQUIRY_MESSAGES.NOT_ASSIGNED_TO_JOB);
    }

    const currentSpec = (enquiry.specificationDetails as any) || {};
    const existingBreaks = Array.isArray(currentSpec.breaks) ? currentSpec.breaks : [];
    const pastBreaksSeconds = existingBreaks.reduce(
      (acc: number, b: any) =>
        acc + (b.durationSeconds || (b.durationMinutes || 0) * 60),
      0,
    );
    let accruedWorkSeconds = 0;
    if (enquiry.workStartedAt) {
      const diffMs = Date.now() - new Date(enquiry.workStartedAt).getTime();
      accruedWorkSeconds = Math.max(0, Math.floor(diffMs / 1000) - pastBreaksSeconds);
    }
    const accruedWorkMinutes = Math.max(0, Math.round(accruedWorkSeconds / 60));

    const updatedSpec = {
      ...currentSpec,
      activeBreak: {
        reason: dto.reason,
        startedAt: new Date().toISOString(),
        notes: dto.notes || undefined,
      },
      isTimerPaused: true,
      actualWorkMinutes: accruedWorkMinutes,
      actualWorkSeconds: accruedWorkSeconds,
    };

    const updated = await this.enquiryRepo.saveDraftTransaction(enquiryId, {
      specificationDetails: updatedSpec,
      notes: dto.notes,
    });

    return {
      message: ENQUIRY_MESSAGES.WORK_TIMER_PAUSED,
      enquiry: updated,
    };
  }

  async resumeWorkTimer(
    enquiryId: string,
    workerId: string,
    dto: ResumeWorkTimerDto,
    userRole?: Role,
  ) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }

    const isAdminOrStaff = userRole === Role.SUPER_ADMIN || userRole === Role.OFFICE_STAFF;
    if (!isAdminOrStaff && !this.isWorkerAssignedToJob(enquiry, workerId)) {
      throw new ForbiddenException(ENQUIRY_MESSAGES.NOT_ASSIGNED_TO_JOB);
    }

    const currentSpec = (enquiry.specificationDetails as any) || {};
    const activeBreak = currentSpec.activeBreak;
    const existingBreaks = Array.isArray(currentSpec.breaks) ? currentSpec.breaks : [];

    let breakDurationMinutes = 0;
    let breakDurationSeconds = 0;
    if (activeBreak?.startedAt) {
      const diffMs = Date.now() - new Date(activeBreak.startedAt).getTime();
      breakDurationSeconds = Math.max(1, Math.floor(diffMs / 1000));
      breakDurationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
    }

    const completedBreak = activeBreak
      ? {
          reason: activeBreak.reason,
          start: activeBreak.startedAt,
          end: new Date().toISOString(),
          durationMinutes: breakDurationMinutes,
          durationSeconds: breakDurationSeconds,
          notes: activeBreak.notes,
        }
      : null;

    const allBreaks = completedBreak ? [...existingBreaks, completedBreak] : existingBreaks;
    const totalBreakMinutes = allBreaks.reduce((acc: number, b: any) => acc + (b.durationMinutes || 0), 0);
    const totalBreakSeconds = allBreaks.reduce((acc: number, b: any) => acc + (b.durationSeconds || (b.durationMinutes || 0) * 60), 0);

    let accruedWorkSeconds = 0;
    if (enquiry.workStartedAt) {
      const startMs = new Date(enquiry.workStartedAt).getTime();
      const breakStartMs = activeBreak?.startedAt ? new Date(activeBreak.startedAt).getTime() : Date.now();
      accruedWorkSeconds = Math.max(0, Math.floor((breakStartMs - startMs) / 1000) - (totalBreakSeconds - breakDurationSeconds));
    }
    const accruedWorkMinutes = Math.max(0, Math.round(accruedWorkSeconds / 60));

    const updatedSpec = {
      ...currentSpec,
      activeBreak: null,
      isTimerPaused: false,
      breaks: allBreaks,
      breakCount: allBreaks.length,
      totalBreakMinutes,
      totalBreakSeconds,
      actualWorkMinutes: accruedWorkMinutes,
      actualWorkSeconds: accruedWorkSeconds,
    };

    const updated = await this.enquiryRepo.saveDraftTransaction(enquiryId, {
      specificationDetails: updatedSpec,
      notes: dto.notes,
    });

    return {
      message: ENQUIRY_MESSAGES.WORK_TIMER_RESUMED,
      enquiry: updated,
    };
  }

  async saveWorkDraft(
    enquiryId: string,
    workerId: string,
    dto: SaveWorkDraftDto,
    userRole?: Role,
  ) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }

    const isAdminOrStaff = userRole === Role.SUPER_ADMIN || userRole === Role.OFFICE_STAFF;
    if (!isAdminOrStaff && !this.isWorkerAssignedToJob(enquiry, workerId)) {
      throw new ForbiddenException(ENQUIRY_MESSAGES.NOT_ASSIGNED_TO_JOB);
    }

    const currentSpec = (enquiry.specificationDetails as any) || {};
    const updatedSpec = {
      ...currentSpec,
      ...(dto.specificationDetails || {}),
      temporaryCount:
        dto.completedUnits !== undefined ? dto.completedUnits : currentSpec.temporaryCount,
      lastDraftSavedAt: new Date().toISOString(),
    };

    const updated = await this.enquiryRepo.saveDraftTransaction(enquiryId, {
      completedUnits: dto.completedUnits,
      specificationDetails: updatedSpec,
      notes: dto.notes,
    });

    return {
      message: ENQUIRY_MESSAGES.WORK_DRAFT_SAVED,
      enquiry: updated,
    };
  }

  async stopWorkTimer(
    enquiryId: string,
    workerId: string,
    dto: StopWorkTimerDto,
    userRole?: Role,
  ) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }

    const isAdminOrStaff = userRole === Role.SUPER_ADMIN || userRole === Role.OFFICE_STAFF;
    if (!isAdminOrStaff && !this.isWorkerAssignedToJob(enquiry, workerId)) {
      throw new ForbiddenException(ENQUIRY_MESSAGES.NOT_ASSIGNED_TO_JOB);
    }

    const effectiveWorkerId = enquiry.workerId || workerId;

    const updated = await this.enquiryRepo.stopWorkTimerTransaction(
      enquiryId,
      effectiveWorkerId,
      dto,
    );

    return {
      message: ENQUIRY_MESSAGES.WORK_TIMER_STOPPED,
      enquiry: updated,
    };
  }

  async updateWorkerJobStatus(
    enquiryId: string,
    dto: UpdateEnquiryStatusDto,
    workerId: string,
    userRole?: Role,
  ) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }

    const isAdminOrStaff = userRole === Role.SUPER_ADMIN || userRole === Role.OFFICE_STAFF;
    if (!isAdminOrStaff && !this.isWorkerAssignedToJob(enquiry, workerId)) {
      throw new ForbiddenException(ENQUIRY_MESSAGES.NOT_ASSIGNED_TO_JOB);
    }

    const updated = await this.enquiryRepo.updateJobStatusTransaction(
      enquiryId,
      dto.status,
      dto.notes,
      {
        completedUnits: dto.completedUnits,
        specificationDetails: dto.specificationDetails,
      },
    );

    if (updated) {
      const isCompleted = dto.status === ServiceStatus.COMPLETED;
      const actionName = isCompleted ? 'WORK_COMPLETED' : `STATUS_UPDATE_${dto.status}`;

      await this.auditService.recordLog({
        userId: workerId,
        userRole: userRole || Role.WORKER,
        action: actionName,
        entityType: 'SERVICE_ENQUIRY',
        entityId: enquiryId,
        details: {
          trackingNumber: updated.trackingNumber,
          serviceName: updated.serviceName,
          status: dto.status,
          completedUnits: dto.completedUnits,
          totalCalculatedWage: updated.totalCalculatedWage,
          totalCalculatedCost: updated.totalCalculatedCost,
          notes: dto.notes,
        },
      });

      if (updated.customerId) {
        await this.notificationService.notifyUser({
          userId: updated.customerId,
          title: isCompleted ? 'Service Completed!' : `Job Status: ${dto.status}`,
          message: isCompleted
            ? `Your service ${updated.serviceName} has been completed! Billable total: ₹${updated.totalCalculatedCost || 'N/A'}.`
            : `Technician updated status to ${dto.status} for order ${updated.trackingNumber}.`,
          type: isCompleted ? NotificationType.SUCCESS : NotificationType.INFO,
          link: '/dashboard',
        });
      }

      if (isCompleted) {
        await this.notificationService.notifyAdminsAndStaff({
          title: `Work Completed: ${updated.serviceName}`,
          message: `Order ${updated.trackingNumber} completed by field technician. Units: ${dto.completedUnits || '—'}, Wage: ₹${updated.totalCalculatedWage || '—'}`,
          type: NotificationType.SUCCESS,
          link: '/admin/operations/enquiries',
        });
      }
    }

    return {
      message: ENQUIRY_MESSAGES.STATUS_UPDATED_SUCCESS,
      enquiry: updated,
    };
  }

  async updateWorkerDuty(workerId: string, dto: UpdateWorkerDutyDto) {
    if (
      dto.workerStatus !== WorkerStatus.AVAILABLE &&
      dto.workerStatus !== WorkerStatus.OFF_DUTY
    ) {
      throw new BadRequestException(
        'Worker can only set status to AVAILABLE or OFF_DUTY',
      );
    }

    const updatedWorker = await this.enquiryRepo.updateWorkerDutyStatus(
      workerId,
      dto.workerStatus,
    );

    return {
      message: ENQUIRY_MESSAGES.WORKER_STATUS_UPDATED,
      worker: updatedWorker,
    };
  }

  async getCustomerEnquiries(customerId: string) {
    const enquiries = await this.enquiryRepo.findByCustomerId(customerId);
    return {
      enquiries,
    };
  }
}
