import { Injectable } from '@nestjs/common';
import {
  AttendanceStatus,
  PrismaService,
  Role,
  StaffStatus,
  WorkerStatus,
} from '../../database';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserWithTodayAttendance(userId: string, date: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        workerStatus: true,
        staffStatus: true,
        attendances: {
          where: { date },
          take: 1,
        },
      },
    });

    return user;
  }

  async upsertAttendance(
    userId: string,
    date: string,
    data: {
      status: AttendanceStatus;
      checkInAt?: Date;
      checkOutAt?: Date | null;
      notes?: string;
    },
  ) {
    return this.prisma.attendance.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      create: {
        userId,
        date,
        status: data.status,
        checkInAt: data.checkInAt ?? new Date(),
        checkOutAt: data.checkOutAt,
        notes: data.notes,
      },
      update: {
        status: data.status,
        checkOutAt: data.checkOutAt,
        notes: data.notes,
      },
    });
  }

  async updateStaffStatus(userId: string, staffStatus: StaffStatus) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { staffStatus },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        staffStatus: true,
      },
    });
  }

  async updateWorkerStatus(userId: string, workerStatus: WorkerStatus) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { workerStatus },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        workerStatus: true,
      },
    });
  }

  async getStaffAndWorkerOverview(date: string) {
    const [officeStaff, workers] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          role: Role.OFFICE_STAFF,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phone: true,
          role: true,
          staffStatus: true,
          attendances: {
            where: { date },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.findMany({
        where: {
          role: Role.WORKER,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phone: true,
          role: true,
          workerStatus: true,
          attendances: {
            where: { date },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return { officeStaff, workers };
  }
}
