import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, Roles } from '../../common';
import { Role } from '../../database';
import { ReminderService } from './reminder.service';
import {
  CreateReminderDto,
  ListRemindersDto,
  UpdateReminderDto,
  UpdateServiceReminderConfigDto,
} from './dto';

@Controller('admin/reminders')
@Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF)
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Get()
  async listReminders(@Query() dto: ListRemindersDto) {
    return this.reminderService.listReminders(dto);
  }

  @Get('stats/summary')
  async getStatsSummary() {
    return this.reminderService.getStatsSummary();
  }

  @Get('service-configs')
  async listServiceConfigs() {
    return this.reminderService.listServiceConfigs();
  }

  @Patch('service-configs/:serviceId')
  async updateServiceConfig(
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateServiceReminderConfigDto,
  ) {
    return this.reminderService.updateServiceConfig(serviceId, dto);
  }

  @Get(':id')
  async getReminderById(@Param('id') id: string) {
    return this.reminderService.getReminderById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createReminder(
    @Body() dto: CreateReminderDto,
    @CurrentUser('id') creatorId?: string,
  ) {
    return this.reminderService.createReminder(dto, creatorId);
  }

  @Patch(':id')
  async updateReminder(
    @Param('id') id: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.reminderService.updateReminder(id, dto);
  }

  @Post(':id/complete-cycle')
  @HttpCode(HttpStatus.OK)
  async completeCycleAndReschedule(@Param('id') id: string) {
    return this.reminderService.completeCycleAndReschedule(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteReminder(@Param('id') id: string) {
    return this.reminderService.deleteReminder(id);
  }
}
