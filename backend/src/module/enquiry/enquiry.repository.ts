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
    location?: string;
    preferredDate?: Date;
    message: string;
    customerId?: string;
  }) {
    return this.prisma.serviceEnquiry.create({
      data: {
        trackingNumber: data.trackingNumber,
        serviceName: data.serviceName,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        location: data.location,
        preferredDate: data.preferredDate,
        message: data.message,
        customerId: data.customerId,
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
            select: { id: true, name: true, username: true, avatar: true },
          },
          worker: {
            select: { id: true, name: true, username: true, phone: true, avatar: true, workerStatus: true },
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
        officeStaff: { select: { id: true, name: true, username: true, avatar: true } },
        worker: { select: { id: true, name: true, username: true, phone: true, avatar: true, workerStatus: true } },
      },
    });
  }

  async findByTrackingNumber(trackingNumber: string) {
    return this.prisma.serviceEnquiry.findUnique({
      where: { trackingNumber },
      include: {
        worker: { select: { id: true, name: true, phone: true, workerStatus: true } },
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
    notes?: string,
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
          notes: notes ? notes : undefined,
        },
        include: {
          worker: {
            select: { id: true, name: true, phone: true, workerStatus: true },
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
        officeStaff: { select: { id: true, name: true, username: true, avatar: true } },
      },
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
      },
    });
  }
}
