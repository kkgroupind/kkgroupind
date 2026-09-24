import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser, Roles } from '../../common';
import { Role } from '../../database';
import { AttendanceService } from './attendance.service';
import { UpdateAttendanceDto } from './dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles(Role.OFFICE_STAFF, Role.WORKER, Role.SUPER_ADMIN)
  @Get('today')
  async getTodayAttendance(@CurrentUser('id') userId: string) {
    return this.attendanceService.getTodayAttendance(userId);
  }

  @Roles(Role.OFFICE_STAFF, Role.WORKER)
  @Post('status')
  @HttpCode(HttpStatus.OK)
  async updateAttendance(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.updateAttendance(userId, role, dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF)
  @Get('overview')
  async getAttendanceOverview() {
    return this.attendanceService.getAttendanceOverview();
  }
}
