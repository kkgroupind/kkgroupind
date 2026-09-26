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
} from './dto';
import { ENQUIRY_MESSAGES } from '../../common';
import { Role, ServiceStatus, WorkerStatus } from '../../database';

@Injectable()
export class EnquiryService {
  constructor(private readonly enquiryRepo: EnquiryRepository) {}

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

  async assignWorker(
    enquiryId: string,
    dto: AssignWorkerDto,
    officeStaffId: string,
  ) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }

    const worker = await this.enquiryRepo.findWorkerById(dto.workerId);
    if (!worker) {
      throw new NotFoundException(ENQUIRY_MESSAGES.WORKER_NOT_FOUND);
    }

    // STRICT RULE: Worker must be AVAILABLE to be assigned
    if (worker.workerStatus !== WorkerStatus.AVAILABLE) {
      throw new BadRequestException(ENQUIRY_MESSAGES.CANNOT_ASSIGN_UNAVAILABLE);
    }

    let parsedDeadline: Date | undefined = undefined;
    if (dto.deadline) {
      const candidate = new Date(dto.deadline);
      if (!isNaN(candidate.getTime())) {
        parsedDeadline = candidate;
      }
    }

    const updated = await this.enquiryRepo.assignWorkerTransaction(
      enquiryId,
      dto.workerId,
      officeStaffId,
      {
        notes: dto.notes,
        mapUrl: dto.mapUrl,
        locationRemarks: dto.locationRemarks,
        isHourlyCalculated: dto.isHourlyCalculated,
        hourlyRate: dto.hourlyRate,
        deadline: parsedDeadline,
      },
    );

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

    if (enquiry.workerId !== workerId) {
      throw new ForbiddenException('You are not assigned to this job');
    }

    const updated = await this.enquiryRepo.acceptJobTransaction(
      enquiryId,
      workerId,
      dto,
    );

    return {
      message: ENQUIRY_MESSAGES.JOB_ACCEPTED_SUCCESS,
      enquiry: updated,
    };
  }

  async startWorkTimer(
    enquiryId: string,
    workerId: string,
    dto: StartWorkTimerDto,
  ) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }

    if (enquiry.workerId !== workerId) {
      throw new ForbiddenException('You are not authorized for this job');
    }

    const updated = await this.enquiryRepo.startWorkTimerTransaction(
      enquiryId,
      workerId,
      dto,
    );

    return {
      message: ENQUIRY_MESSAGES.WORK_TIMER_STARTED,
      enquiry: updated,
    };
  }

  async stopWorkTimer(
    enquiryId: string,
    workerId: string,
    dto: StopWorkTimerDto,
  ) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }

    if (enquiry.workerId !== workerId) {
      throw new ForbiddenException('You are not authorized for this job');
    }

    const updated = await this.enquiryRepo.stopWorkTimerTransaction(
      enquiryId,
      workerId,
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
  ) {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException(ENQUIRY_MESSAGES.ENQUIRY_NOT_FOUND);
    }

    if (enquiry.workerId !== workerId) {
      throw new ForbiddenException('You are not authorized to update this job');
    }

    const updated = await this.enquiryRepo.updateJobStatusTransaction(
      enquiryId,
      dto.status,
      dto.notes,
    );

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
