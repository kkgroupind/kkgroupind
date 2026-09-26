import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, Public, Roles } from '../../common';
import { Role, ServiceStatus } from '../../database';
import { EnquiryService } from './enquiry.service';
import {
  CreateEnquiryDto,
  AssignWorkerDto,
  UpdateEnquiryStatusDto,
  UpdateWorkerDutyDto,
  AcceptJobDto,
  StartWorkTimerDto,
  StopWorkTimerDto,
} from './dto';

@Controller('enquiries')
export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEnquiry(
    @Body() dto: CreateEnquiryDto,
    @CurrentUser() user?: { id?: string; role?: Role },
  ) {
    return this.enquiryService.createEnquiry(dto, user);
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF)
  @Get()
  async getAllEnquiries(
    @Query('status') status?: ServiceStatus,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.enquiryService.getAllEnquiries({ status, search, page, limit });
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF, Role.WORKER)
  @Get('workers')
  async getActiveWorkers() {
    return this.enquiryService.getActiveWorkers();
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF)
  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assignWorker(
    @Param('id') id: string,
    @Body() dto: AssignWorkerDto,
    @CurrentUser('id') officeStaffId: string,
  ) {
    return this.enquiryService.assignWorker(id, dto, officeStaffId);
  }

  @Roles(Role.WORKER)
  @Get('worker/my-jobs')
  async getWorkerJobs(
    @CurrentUser('id') workerId: string,
    @Query('status') status?: ServiceStatus,
  ) {
    return this.enquiryService.getWorkerJobs(workerId, status);
  }

  @Roles(Role.WORKER)
  @Patch('worker/:id/accept')
  async acceptWorkerJob(
    @Param('id') id: string,
    @Body() dto: AcceptJobDto,
    @CurrentUser('id') workerId: string,
  ) {
    return this.enquiryService.acceptWorkerJob(id, workerId, dto);
  }

  @Roles(Role.WORKER)
  @Post('worker/:id/start-timer')
  async startWorkTimer(
    @Param('id') id: string,
    @Body() dto: StartWorkTimerDto,
    @CurrentUser('id') workerId: string,
  ) {
    return this.enquiryService.startWorkTimer(id, workerId, dto);
  }

  @Roles(Role.WORKER)
  @Post('worker/:id/stop-timer')
  async stopWorkTimer(
    @Param('id') id: string,
    @Body() dto: StopWorkTimerDto,
    @CurrentUser('id') workerId: string,
  ) {
    return this.enquiryService.stopWorkTimer(id, workerId, dto);
  }

  @Roles(Role.WORKER)
  @Patch('worker/:id/status')
  async updateWorkerJobStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEnquiryStatusDto,
    @CurrentUser('id') workerId: string,
  ) {
    return this.enquiryService.updateWorkerJobStatus(id, dto, workerId);
  }

  @Roles(Role.WORKER)
  @Patch('worker/duty-status')
  async updateWorkerDuty(
    @CurrentUser('id') workerId: string,
    @Body() dto: UpdateWorkerDutyDto,
  ) {
    return this.enquiryService.updateWorkerDuty(workerId, dto);
  }

  @Roles(Role.CUSTOMER)
  @Get('customer/my-enquiries')
  async getCustomerEnquiries(@CurrentUser('id') customerId: string) {
    return this.enquiryService.getCustomerEnquiries(customerId);
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF, Role.WORKER, Role.CUSTOMER)
  @Get(':id')
  async getEnquiryById(@Param('id') id: string) {
    return this.enquiryService.getEnquiryById(id);
  }
}
