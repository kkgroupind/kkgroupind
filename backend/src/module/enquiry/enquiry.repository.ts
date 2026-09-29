import { Injectable } from '@nestjs/common';
import { PrismaService, Role, ServiceStatus, WorkerStatus } from '../../database';

@Injectable()
export class EnquiryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    trackingNumber: string;
    serviceName: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    state?: string;
    district?: string;
    city?: string;
    location?: string;
    mapUrl?: string;
    locationRemarks?: string;
    preferredDate?: Date;
    deadline?: Date;
    message: string;
    customerId?: string;
    createdByRole?: Role;
    createdById?: string;
    wageType?: string;
    unitLabel?: string;
    unitRate?: number;
    workerUnitWage?: number;
    minUnits?: number;
    isHourlyCalculated?: boolean;
  }) {
    return this.prisma.serviceEnquiry.create({
      data: {
        trackingNumber: data.trackingNumber,
        serviceName: data.serviceName,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        state: data.state || 'Kerala',
        district: data.district || 'Kasaragod',
        city: data.city,
        location: data.location,
        mapUrl: data.mapUrl,
        locationRemarks: data.locationRemarks,
        preferredDate: data.preferredDate,
        deadline: data.deadline,
        message: data.message,
        customerId: data.customerId,
        createdByRole: data.createdByRole || Role.CUSTOMER,
        createdById: data.createdById,
        wageType: data.wageType,
        unitLabel: data.unitLabel,
        unitRate: data.unitRate,
        workerUnitWage: data.workerUnitWage,
        minUnits: data.minUnits,
        isHourlyCalculated: data.isHourlyCalculated || false,
      },
      include: {
        creator: {
          select: { id: true, name: true, username: true, phone: true, role: true },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
      },
    });
  }

  async findAllPaginated(params: {
    status?: ServiceStatus;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      where.OR = [
        { trackingNumber: { contains: params.search, mode: 'insensitive' } },
        { serviceName: { contains: params.search, mode: 'insensitive' } },
        { customerName: { contains: params.search, mode: 'insensitive' } },
        { customerPhone: { contains: params.search, mode: 'insensitive' } },
        { district: { contains: params.search, mode: 'insensitive' } },
        { city: { contains: params.search, mode: 'insensitive' } },
        { location: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.serviceEnquiry.findMany({
        where,
        skip: params.skip || 0,
        take: params.take || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true, avatar: true },
          },
          officeStaff: {
            select: { id: true, name: true, username: true, phone: true, avatar: true },
          },
          worker: {
            select: { id: true, name: true, username: true, phone: true, avatar: true, workerStatus: true },
          },
          creator: {
            select: { id: true, name: true, username: true, phone: true, role: true },
          },
        },
      }),
      this.prisma.serviceEnquiry.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.serviceEnquiry.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        officeStaff: { select: { id: true, name: true, username: true, phone: true, avatar: true } },
        worker: { select: { id: true, name: true, username: true, phone: true, avatar: true, workerStatus: true } },
        creator: { select: { id: true, name: true, username: true, phone: true, role: true } },
      },
    });
  }

  async findByTrackingNumber(trackingNumber: string) {
    return this.prisma.serviceEnquiry.findUnique({
      where: { trackingNumber },
      include: {
        worker: { select: { id: true, name: true, phone: true, workerStatus: true } },
        creator: { select: { id: true, name: true, username: true, phone: true, role: true } },
      },
    });
  }

  async findWorkerById(workerId: string) {
    return this.prisma.user.findFirst({
      where: {
        id: workerId,
        role: Role.WORKER,
        isActive: true,
      },
    });
  }

  async findActiveWorkers() {
    return this.prisma.user.findMany({
      where: {
        role: Role.WORKER,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        phone: true,
        avatar: true,
        workerStatus: true,
        _count: {
          select: {
            workerAssignments: {
              where: {
                status: {
                  in: [ServiceStatus.ASSIGNED, ServiceStatus.IN_PROGRESS],
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findWorkersByIds(workerIds: string[]) {
    return this.prisma.user.findMany({
      where: {
        id: { in: workerIds },
        role: Role.WORKER,
      },
    });
  }

  async assignWorkerTransaction(
    enquiryId: string,
    workerId: string,
    officeStaffId: string,
    data?: {
      notes?: string;
      mapUrl?: string;
      locationRemarks?: string;
      isHourlyCalculated?: boolean;
      hourlyRate?: number;
      wageType?: string;
      unitLabel?: string;
      unitRate?: number;
      workerUnitWage?: number;
      estimatedUnits?: number;
      minUnits?: number;
      specificationDetails?: any;
      deadline?: Date;
      squadWorkerIds?: string[];
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update enquiry
      const updatedEnquiry = await tx.serviceEnquiry.update({
        where: { id: enquiryId },
        data: {
          workerId,
          officeStaffId,
          status: ServiceStatus.ASSIGNED,
          assignedAt: new Date(),
          notes: data?.notes !== undefined ? data.notes : undefined,
          mapUrl: data?.mapUrl !== undefined ? data.mapUrl : undefined,
          locationRemarks: data?.locationRemarks !== undefined ? data.locationRemarks : undefined,
          isHourlyCalculated: data?.isHourlyCalculated !== undefined ? data.isHourlyCalculated : (data?.wageType === 'HOURLY'),
          hourlyRate: data?.hourlyRate !== undefined ? data.hourlyRate : (data?.wageType === 'HOURLY' ? data?.unitRate : undefined),
          wageType: data?.wageType !== undefined ? data.wageType : undefined,
          unitLabel: data?.unitLabel !== undefined ? data.unitLabel : undefined,
          unitRate: data?.unitRate !== undefined ? data.unitRate : data?.hourlyRate,
          workerUnitWage: data?.workerUnitWage !== undefined ? data.workerUnitWage : undefined,
          estimatedUnits: data?.estimatedUnits !== undefined ? data.estimatedUnits : undefined,
          minUnits: data?.minUnits !== undefined ? data.minUnits : undefined,
          specificationDetails: data?.specificationDetails !== undefined ? data.specificationDetails : undefined,
          deadline: data?.deadline !== undefined ? data.deadline : undefined,
        },
        include: {
          worker: {
            select: { id: true, name: true, phone: true, workerStatus: true },
          },
          creator: {
            select: { id: true, name: true, username: true, phone: true, role: true },
          },
          customer: {
            select: { id: true, name: true, email: true, phone: true, avatar: true },
          },
          officeStaff: {
            select: { id: true, name: true, username: true, phone: true, avatar: true },
          },
        },
      });

      // 2. Mark primary worker and all squad workers as BUSY
      const allWorkerIds = Array.from(
        new Set([workerId, ...(data?.squadWorkerIds || [])]),
      ).filter(Boolean);

      await tx.user.updateMany({
        where: { id: { in: allWorkerIds } },
        data: { workerStatus: WorkerStatus.BUSY },
      });

      return updatedEnquiry;
    });
  }

  async findJobsByWorker(workerId: string, status?: ServiceStatus) {
    const where: any = {
      OR: [
        { workerId },
        {
          specificationDetails: {
            path: ['squadWorkerIds'],
            array_contains: workerId,
          },
        },
      ],
    };
    if (status) {
      where.status = status;
    }

    return this.prisma.serviceEnquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        worker: { select: { id: true, name: true, phone: true } },
        officeStaff: { select: { id: true, name: true, username: true, phone: true, avatar: true } },
        creator: { select: { id: true, name: true, username: true, phone: true, role: true } },
      },
    });
  }

  async acceptJobTransaction(
    enquiryId: string,
    workerId: string,
    data: { workerAcceptance?: string; notes?: string },
  ) {
    return this.prisma.serviceEnquiry.update({
      where: { id: enquiryId },
      data: {
        workerAcceptance: data.workerAcceptance || 'ACCEPTED_SAME_DAY',
        notes: data.notes ? data.notes : undefined,
      },
      include: {
        worker: { select: { id: true, name: true, phone: true, workerStatus: true } },
        customer: { select: { id: true, name: true, phone: true, email: true } },
        officeStaff: { select: { id: true, name: true, username: true, phone: true } },
      },
    });
  }

  async startWorkTimerTransaction(
    enquiryId: string,
    workerId: string,
    data?: { notes?: string },
  ) {
    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const enquiry = await tx.serviceEnquiry.findUnique({ where: { id: enquiryId } });
      const currentSpec = (enquiry?.specificationDetails as any) || {};
      const updatedSpec = {
        ...currentSpec,
        workStartedAt: now.toISOString(),
        actualWorkMinutes: 0,
        actualWorkSeconds: 0,
        totalBreakMinutes: 0,
        totalBreakSeconds: 0,
        breaks: Array.isArray(currentSpec.breaks) ? currentSpec.breaks : [],
        activeBreak: null,
        isTimerPaused: false,
      };

      return tx.serviceEnquiry.update({
        where: { id: enquiryId },
        data: {
          status: ServiceStatus.IN_PROGRESS,
          workStartedAt: now,
          specificationDetails: updatedSpec,
          notes: data?.notes ? data.notes : undefined,
        },
        include: {
          worker: { select: { id: true, name: true, phone: true, workerStatus: true } },
          customer: { select: { id: true, name: true, phone: true, email: true } },
          officeStaff: { select: { id: true, name: true, username: true, phone: true } },
        },
      });
    });
  }

  async stopWorkTimerTransaction(
    enquiryId: string,
    workerId: string,
    data?: {
      durationMinutes?: number;
      completedUnits?: number;
      specificationDetails?: any;
      completionNotes?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const enquiry = await tx.serviceEnquiry.findUnique({
        where: { id: enquiryId },
      });

      if (!enquiry) {
        return null;
      }

      const now = new Date();
      let calculatedMinutes = data?.durationMinutes;

      const spec = (data?.specificationDetails ?? enquiry.specificationDetails) as any || {};
      const breaks = Array.isArray(spec.breaks) ? [...spec.breaks] : [];
      let totalBreakMinutes = breaks.reduce((acc: number, b: any) => acc + (b.durationMinutes || 0), 0);
      let totalBreakSeconds = breaks.reduce((acc: number, b: any) => acc + (b.durationSeconds || (b.durationMinutes || 0) * 60), 0);

      // Finalize active break if still ongoing when completing
      if (spec.activeBreak?.startedAt) {
        const breakStartMs = new Date(spec.activeBreak.startedAt).getTime();
        const breakSec = Math.max(1, Math.floor((now.getTime() - breakStartMs) / 1000));
        const breakMin = Math.max(1, Math.round(breakSec / 60));
        breaks.push({
          reason: spec.activeBreak.reason || 'General Break',
          start: spec.activeBreak.startedAt,
          end: now.toISOString(),
          durationMinutes: breakMin,
          durationSeconds: breakSec,
          notes: spec.activeBreak.notes,
        });
        totalBreakMinutes += breakMin;
        totalBreakSeconds += breakSec;
      }

      let grossMinutes = 0;
      let grossSeconds = 0;
      if (enquiry.workStartedAt) {
        const diffMs = now.getTime() - new Date(enquiry.workStartedAt).getTime();
        grossMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
        grossSeconds = Math.max(1, Math.floor(diffMs / 1000));
      }

      if (calculatedMinutes === undefined && enquiry.workStartedAt) {
        calculatedMinutes = Math.max(1, grossMinutes - totalBreakMinutes);
      }

      const actualWorkMinutes = calculatedMinutes ?? Math.max(1, grossMinutes - totalBreakMinutes);
      const actualWorkSeconds = Math.max(0, grossSeconds - totalBreakSeconds);

      // Permanent and comprehensive time tracking specification details
      const updatedSpec = {
        ...spec,
        workStartedAt: enquiry.workStartedAt ? enquiry.workStartedAt.toISOString() : undefined,
        workEndedAt: now.toISOString(),
        grossDurationMinutes: grossMinutes,
        grossDurationSeconds: grossSeconds,
        actualWorkMinutes,
        actualWorkSeconds,
        totalBreakMinutes,
        totalBreakSeconds,
        breaks,
        breakCount: breaks.length,
        activeBreak: null,
        isTimerPaused: false,
      };

      // Compute completed units & wage/cost totals
      let finalCompletedUnits = data?.completedUnits;
      if (finalCompletedUnits === undefined || finalCompletedUnits === null) {
        if (enquiry.wageType === 'HOURLY' || enquiry.isHourlyCalculated) {
          finalCompletedUnits = actualWorkMinutes
            ? Math.round((actualWorkMinutes / 60) * 10) / 10
            : enquiry.completedUnits ?? 0;
        } else {
          finalCompletedUnits = enquiry.estimatedUnits ?? 1;
        }
      }

      // Prices and wages are set exclusively by Admin / Office Staff after work is finished
      const computedWage = enquiry.totalCalculatedWage ?? null;
      const computedCost = enquiry.totalCalculatedCost ?? null;

      const updated = await tx.serviceEnquiry.update({
        where: { id: enquiryId },
        data: {
          status: ServiceStatus.COMPLETED,
          workEndedAt: now,
          completedAt: now,
          workDurationMinutes: actualWorkMinutes,
          completedUnits: finalCompletedUnits,
          totalCalculatedWage: computedWage,
          totalCalculatedCost: computedCost,
          specificationDetails: updatedSpec,
          notes: data?.completionNotes ? data.completionNotes : enquiry.notes,
        },
        include: {
          worker: { select: { id: true, name: true, phone: true, workerStatus: true } },
          customer: { select: { id: true, name: true, phone: true, email: true } },
          officeStaff: { select: { id: true, name: true, username: true, phone: true } },
        },
      });

      // Free primary worker and all squad workers back to AVAILABLE if no other active jobs
      const squadIds = ((enquiry.specificationDetails as any)?.squadWorkerIds as string[]) || [];
      const allWorkerIds = Array.from(
        new Set([workerId, enquiry.workerId, ...squadIds]),
      ).filter(Boolean) as string[];

      for (const wId of allWorkerIds) {
        const remainingActiveJobs = await tx.serviceEnquiry.count({
          where: {
            OR: [
              { workerId: wId },
              {
                specificationDetails: {
                  path: ['squadWorkerIds'],
                  array_contains: wId,
                },
              },
            ],
            id: { not: enquiryId },
            status: { in: [ServiceStatus.ASSIGNED, ServiceStatus.IN_PROGRESS] },
          },
        });

        if (remainingActiveJobs === 0) {
          await tx.user.update({
            where: { id: wId },
            data: { workerStatus: WorkerStatus.AVAILABLE },
          });
        }
      }

      return updated;
    });
  }

  async updateJobStatusTransaction(
    enquiryId: string,
    status: ServiceStatus,
    notes?: string,
    data?: {
      completedUnits?: number;
      specificationDetails?: any;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const enquiry = await tx.serviceEnquiry.findUnique({
        where: { id: enquiryId },
      });

      if (!enquiry) {
        return null;
      }

      const isCompleted = status === ServiceStatus.COMPLETED;
      const isFinished =
        status === ServiceStatus.COMPLETED || status === ServiceStatus.CANCELLED;

      let computedWage: number | null | undefined = undefined;
      let computedCost: number | null | undefined = undefined;
      let finalCompletedUnits = data?.completedUnits;

      if (isCompleted) {
        if (finalCompletedUnits === undefined || finalCompletedUnits === null) {
          finalCompletedUnits = enquiry.completedUnits ?? enquiry.estimatedUnits ?? 1;
        }
        // Price and payout will be set on admin side or office staff side only after the work is finished
        computedWage = enquiry.totalCalculatedWage ?? null;
        computedCost = enquiry.totalCalculatedCost ?? null;
      }

      const updated = await tx.serviceEnquiry.update({
        where: { id: enquiryId },
        data: {
          status,
          notes: notes ? notes : undefined,
          completedAt: isCompleted ? new Date() : undefined,
          completedUnits: finalCompletedUnits !== undefined ? finalCompletedUnits : undefined,
          totalCalculatedWage: computedWage !== undefined ? computedWage : undefined,
          totalCalculatedCost: computedCost !== undefined ? computedCost : undefined,
          specificationDetails: data?.specificationDetails ?? undefined,
        },
      });

      // If finished and has assigned workers, check if each worker has other active jobs
      if (isFinished) {
        const squadIds = ((enquiry.specificationDetails as any)?.squadWorkerIds as string[]) || [];
        const allWorkerIds = Array.from(
          new Set([enquiry.workerId, ...squadIds]),
        ).filter(Boolean) as string[];

        for (const wId of allWorkerIds) {
          const remainingActiveJobs = await tx.serviceEnquiry.count({
            where: {
              OR: [
                { workerId: wId },
                {
                  specificationDetails: {
                    path: ['squadWorkerIds'],
                    array_contains: wId,
                  },
                },
              ],
              id: { not: enquiryId },
              status: { in: [ServiceStatus.ASSIGNED, ServiceStatus.IN_PROGRESS] },
            },
          });

          // If no more active jobs, set worker status back to AVAILABLE
          if (remainingActiveJobs === 0) {
            await tx.user.update({
              where: { id: wId },
              data: { workerStatus: WorkerStatus.AVAILABLE },
            });
          }
        }
      }

      return updated;
    });
  }

  async saveDraftTransaction(
    enquiryId: string,
    data?: {
      completedUnits?: number;
      specificationDetails?: any;
      notes?: string;
    },
  ) {
    return this.prisma.serviceEnquiry.update({
      where: { id: enquiryId },
      data: {
        completedUnits: data?.completedUnits !== undefined ? data.completedUnits : undefined,
        specificationDetails: data?.specificationDetails !== undefined ? data.specificationDetails : undefined,
        notes: data?.notes !== undefined ? data.notes : undefined,
      },
      include: {
        worker: { select: { id: true, name: true, phone: true, workerStatus: true } },
        officeStaff: { select: { id: true, name: true, username: true, phone: true } },
      },
    });
  }

  async updateWorkerDutyStatus(workerId: string, workerStatus: WorkerStatus) {
    return this.prisma.user.update({
      where: { id: workerId },
      data: { workerStatus },
      select: {
        id: true,
        name: true,
        username: true,
        workerStatus: true,
      },
    });
  }

  async findByCustomerId(customerId: string) {
    return this.prisma.serviceEnquiry.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        worker: {
          select: { id: true, name: true, phone: true },
        },
        creator: {
          select: { id: true, name: true, username: true, phone: true, role: true },
        },
      },
    });
  }

  async markReachedSiteTransaction(
    enquiryId: string,
    workerId: string,
    data?: { notes?: string },
  ) {
    return this.prisma.serviceEnquiry.update({
      where: { id: enquiryId },
      data: {
        workerAcceptance: 'REACHED_SITE',
        notes: data?.notes ? data.notes : undefined,
      },
      include: {
        worker: { select: { id: true, name: true, phone: true, workerStatus: true } },
        customer: { select: { id: true, name: true, phone: true, email: true } },
        officeStaff: { select: { id: true, name: true, username: true, phone: true } },
      },
    });
  }

  async updateJobPayTransaction(
    enquiryId: string,
    data: {
      totalCalculatedWage?: number;
      workerUnitWage?: number;
      totalCalculatedCost?: number;
      unitRate?: number;
      completedUnits?: number;
      workDurationMinutes?: number;
      unitLabel?: string;
      status?: ServiceStatus;
      workStartedAt?: Date | string | null;
      workEndedAt?: Date | string | null;
      notes?: string;
      specificationDetails?: any;
    },
  ) {
    return this.prisma.serviceEnquiry.update({
      where: { id: enquiryId },
      data: {
        totalCalculatedWage: data.totalCalculatedWage !== undefined ? data.totalCalculatedWage : undefined,
        workerUnitWage: data.workerUnitWage !== undefined ? data.workerUnitWage : undefined,
        totalCalculatedCost: data.totalCalculatedCost !== undefined ? data.totalCalculatedCost : undefined,
        unitRate: data.unitRate !== undefined ? data.unitRate : undefined,
        completedUnits: data.completedUnits !== undefined ? data.completedUnits : undefined,
        workDurationMinutes: data.workDurationMinutes !== undefined ? data.workDurationMinutes : undefined,
        unitLabel: data.unitLabel !== undefined ? data.unitLabel : undefined,
        status: data.status !== undefined ? data.status : undefined,
        workStartedAt: data.workStartedAt !== undefined ? (data.workStartedAt ? new Date(data.workStartedAt) : null) : undefined,
        workEndedAt: data.workEndedAt !== undefined ? (data.workEndedAt ? new Date(data.workEndedAt) : null) : undefined,
        specificationDetails: data.specificationDetails !== undefined ? data.specificationDetails : undefined,
        notes: data.notes ? data.notes : undefined,
      },
      include: {
        worker: { select: { id: true, name: true, phone: true, workerStatus: true } },
        customer: { select: { id: true, name: true, phone: true, email: true } },
        officeStaff: { select: { id: true, name: true, username: true, phone: true } },
      },
    });
  }
}
