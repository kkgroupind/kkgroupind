import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { AvailabilityStatusInput, UpdateAttendanceDto } from './dto';
import {
  AttendanceStatus,
  Role,
  StaffStatus,
  WorkerStatus,
} from '../../database';
import { ATTENDANCE_MESSAGES, AUTH_MESSAGES } from '../../common';

@Injectable()
export class AttendanceService {
  constructor(private readonly attendanceRepo: AttendanceRepository) {}

  private getTodayDateString(): string {
    const now = new Date();
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
    }).format(now);
  }

  async getTodayAttendance(userId: string) {
    const today = this.getTodayDateString();
    const user = await this.attendanceRepo.findUserWithTodayAttendance(
      userId,
      today,
    );

    if (!user) {
      throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    const todayAttendance =
      user.attendances && user.attendances.length > 0
        ? user.attendances[0]
        : null;

    let isAvailable = false;
    let isMarkedToday = false;

    if (user.role === Role.OFFICE_STAFF) {
      isAvailable = user.staffStatus === StaffStatus.AVAILABLE;
      isMarkedToday = !!todayAttendance;
    } else if (user.role === Role.WORKER) {
      isAvailable = user.workerStatus === WorkerStatus.AVAILABLE;
      isMarkedToday = !!todayAttendance;
    }

    return {
      message: ATTENDANCE_MESSAGES.ATTENDANCE_FETCHED_SUCCESS,
      date: today,
      role: user.role,
      isAvailable,
      isMarkedToday,
      staffStatus: user.staffStatus,
      workerStatus: user.workerStatus,
      attendance: todayAttendance,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async updateAttendance(
    userId: string,
    role: Role,
    dto: UpdateAttendanceDto,
  ) {
    const today = this.getTodayDateString();
    const now = new Date();

    if (role === Role.OFFICE_STAFF) {
      const isAvailable = dto.status === AvailabilityStatusInput.AVAILABLE;
      const targetStaffStatus = isAvailable
        ? StaffStatus.AVAILABLE
        : StaffStatus.OFF_DUTY;
      const targetAttendanceStatus = isAvailable
        ? AttendanceStatus.PRESENT
        : AttendanceStatus.OFF_DUTY;

      const [updatedUser, attendance] = await Promise.all([
        this.attendanceRepo.updateStaffStatus(userId, targetStaffStatus),
        this.attendanceRepo.upsertAttendance(userId, today, {
          status: targetAttendanceStatus,
          checkInAt: isAvailable ? now : undefined,
          checkOutAt: !isAvailable ? now : null,
          notes: dto.notes,
        }),
      ]);

      return {
        message: isAvailable
          ? ATTENDANCE_MESSAGES.OFFICE_DUTY_AVAILABLE
          : ATTENDANCE_MESSAGES.OFFICE_DUTY_OFF,
        date: today,
        isAvailable,
        staffStatus: updatedUser.staffStatus,
        attendance,
      };
    }

    if (role === Role.WORKER) {
      const isAvailable = dto.status === AvailabilityStatusInput.AVAILABLE;
      const targetWorkerStatus = isAvailable
        ? WorkerStatus.AVAILABLE
        : WorkerStatus.OFF_DUTY;
      const targetAttendanceStatus = isAvailable
        ? AttendanceStatus.PRESENT
        : AttendanceStatus.LEAVE;

      const [updatedUser, attendance] = await Promise.all([
        this.attendanceRepo.updateWorkerStatus(userId, targetWorkerStatus),
        this.attendanceRepo.upsertAttendance(userId, today, {
          status: targetAttendanceStatus,
          checkInAt: isAvailable ? now : undefined,
          checkOutAt: !isAvailable ? now : null,
          notes: dto.notes,
        }),
      ]);

      return {
        message: isAvailable
          ? ATTENDANCE_MESSAGES.WORKER_DUTY_AVAILABLE
          : ATTENDANCE_MESSAGES.WORKER_DUTY_OFF,
        date: today,
        isAvailable,
        workerStatus: updatedUser.workerStatus,
        attendance,
      };
    }

    throw new BadRequestException(
      ATTENDANCE_MESSAGES.UNAUTHORIZED_ATTENDANCE,
    );
  }

  async getAttendanceOverview() {
    const today = this.getTodayDateString();
    const { officeStaff, workers } =
      await this.attendanceRepo.getStaffAndWorkerOverview(today);

    const availableOfficeStaff = officeStaff.filter(
      (s) => s.staffStatus === StaffStatus.AVAILABLE,
    ).length;
    const offDutyOfficeStaff = officeStaff.length - availableOfficeStaff;

    const availableWorkers = workers.filter(
      (w) => w.workerStatus === WorkerStatus.AVAILABLE,
    ).length;
    const busyWorkers = workers.filter(
      (w) => w.workerStatus === WorkerStatus.BUSY,
    ).length;
    const offDutyWorkers = workers.filter(
      (w) => w.workerStatus === WorkerStatus.OFF_DUTY,
    ).length;

    return {
      message: ATTENDANCE_MESSAGES.STAFF_OVERVIEW_FETCHED_SUCCESS,
      date: today,
      counts: {
        officeStaff: {
          total: officeStaff.length,
          available: availableOfficeStaff,
          offDuty: offDutyOfficeStaff,
        },
        workers: {
          total: workers.length,
          available: availableWorkers,
          busy: busyWorkers,
          offDuty: offDutyWorkers,
        },
      },
      officeStaff: officeStaff.map((staff) => ({
        id: staff.id,
        name: staff.name,
        username: staff.username,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        staffStatus: staff.staffStatus,
        isAvailable: staff.staffStatus === StaffStatus.AVAILABLE,
        todayAttendance:
          staff.attendances && staff.attendances.length > 0
            ? staff.attendances[0]
            : null,
      })),
      workers: workers.map((worker) => ({
        id: worker.id,
        name: worker.name,
        username: worker.username,
        email: worker.email,
        phone: worker.phone,
        role: worker.role,
        workerStatus: worker.workerStatus,
        isAvailable: worker.workerStatus === WorkerStatus.AVAILABLE,
        todayAttendance:
          worker.attendances && worker.attendances.length > 0
            ? worker.attendances[0]
            : null,
      })),
    };
  }
}
