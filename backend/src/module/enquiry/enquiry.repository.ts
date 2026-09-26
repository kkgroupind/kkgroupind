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
      deadline?: Date;
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
          isHourlyCalculated: data?.isHourlyCalculated !== undefined ? data.isHourlyCalculated : undefined,
          hourlyRate: data?.hourlyRate !== undefined ? data.hourlyRate : undefined,
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

      // 2. Mark worker as BUSY
      await tx.user.update({
        where: { id: workerId },
        data: { workerStatus: WorkerStatus.BUSY },
      });

      return updatedEnquiry;
    });
  }

  async findJobsByWorker(workerId: string, status?: ServiceStatus) {
    const where: any = { workerId };
    if (status) {
      where.status = status;
    }

    return this.prisma.serviceEnquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true, avatar: true } },
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
    return this.prisma.serviceEnquiry.update({
      where: { id: enquiryId },
      data: {
        status: ServiceStatus.IN_PROGRESS,
        workStartedAt: new Date(),
        notes: data?.notes ? data.notes : undefined,
      },
      include: {
        worker: { select: { id: true, name: true, phone: true, workerStatus: true } },
        customer: { select: { id: true, name: true, phone: true, email: true } },
        officeStaff: { select: { id: true, name: true, username: true, phone: true } },
      },
    });
  }

  async stopWorkTimerTransaction(
    enquiryId: string,
    workerId: string,
    data?: { durationMinutes?: number; completionNotes?: string },
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

      if (calculatedMinutes === undefined && enquiry.workStartedAt) {
        const diffMs = now.getTime() - new Date(enquiry.workStartedAt).getTime();
        calculatedMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
      }

      const updated = await tx.serviceEnquiry.update({
        where: { id: enquiryId },
        data: {
          status: ServiceStatus.COMPLETED,
          workEndedAt: now,
          completedAt: now,
          workDurationMinutes: calculatedMinutes,
          notes: data?.completionNotes ? data.completionNotes : enquiry.notes,
        },
        include: {
          worker: { select: { id: true, name: true, phone: true, workerStatus: true } },
          customer: { select: { id: true, name: true, phone: true, email: true } },
          officeStaff: { select: { id: true, name: true, username: true, phone: true } },
        },
      });

      // Free worker back to AVAILABLE if no other active jobs
      const remainingActiveJobs = await tx.serviceEnquiry.count({
        where: {
          workerId,
          id: { not: enquiryId },
          status: { in: [ServiceStatus.ASSIGNED, ServiceStatus.IN_PROGRESS] },
        },
      });

      if (remainingActiveJobs === 0) {
        await tx.user.update({
          where: { id: workerId },
          data: { workerStatus: WorkerStatus.AVAILABLE },
        });
      }

      return updated;
    });
  }

  async updateJobStatusTransaction(
    enquiryId: string,
    status: ServiceStatus,
    notes?: string,
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

      const updated = await tx.serviceEnquiry.update({
        where: { id: enquiryId },
        data: {
          status,
          notes: notes ? notes : undefined,
          completedAt: isCompleted ? new Date() : undefined,
        },
      });

      // If finished and has an assigned worker, check if worker has other active jobs
      if (isFinished && enquiry.workerId) {
        const remainingActiveJobs = await tx.serviceEnquiry.count({
          where: {
            workerId: enquiry.workerId,
            id: { not: enquiryId },
            status: { in: [ServiceStatus.ASSIGNED, ServiceStatus.IN_PROGRESS] },
          },
        });

        // If no more active jobs, set worker status back to AVAILABLE
        if (remainingActiveJobs === 0) {
          await tx.user.update({
            where: { id: enquiry.workerId },
            data: { workerStatus: WorkerStatus.AVAILABLE },
          });
        }
      }

      return updated;
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
}
