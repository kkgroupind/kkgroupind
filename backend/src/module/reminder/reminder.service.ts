import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import { ReminderRepository } from './reminder.repository';
import {
  CreateReminderDto,
  ListRemindersDto,
  UpdateReminderDto,
  UpdateServiceReminderConfigDto,
} from './dto';
import {
  Prisma,
  ReminderFrequency,
  ReminderStatus,
  Role,
  ServiceReminder,
  Service,
} from '../../database';
import { REMINDER_MESSAGES, SECURITY_CONSTANTS } from '../../common';

@Injectable()
export class ReminderService {
  constructor(private readonly reminderRepo: ReminderRepository) {}

  private calculateInitialStatus(dueDate: Date): ReminderStatus {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const threeDaysFromNow = new Date(endOfToday.getTime() + 3 * 24 * 60 * 60 * 1000);

    if (dueDate < startOfToday) {
      return ReminderStatus.OVERDUE;
    }
    if (dueDate <= threeDaysFromNow) {
      return ReminderStatus.DUE;
    }
    return ReminderStatus.UPCOMING;
  }

  private calculateNextDueDate(
    fromDate: Date,
    frequency: ReminderFrequency,
    customIntervalDays?: number,
  ): Date {
    const next = new Date(fromDate);

    switch (frequency) {
      case ReminderFrequency.MONTHLY:
        next.setMonth(next.getMonth() + 1);
        break;
      case ReminderFrequency.EVERY_2_MONTHS:
        next.setMonth(next.getMonth() + 2);
        break;
      case ReminderFrequency.EVERY_3_MONTHS:
        // Coconut plucking standard interval: 90 days / 3 months
        next.setMonth(next.getMonth() + 3);
        break;
      case ReminderFrequency.EVERY_6_MONTHS:
        next.setMonth(next.getMonth() + 6);
        break;
      case ReminderFrequency.YEARLY:
        next.setFullYear(next.getFullYear() + 1);
        break;
      case ReminderFrequency.CUSTOM_DAYS:
        next.setDate(next.getDate() + (customIntervalDays || 30));
        break;
      case ReminderFrequency.ONCE:
      default:
        break;
    }

    return next;
  }

  private async ensureCustomerRecord(
    name: string,
    phone: string,
    email?: string,
  ): Promise<string> {
    const cleanPhone = phone.trim();
    const cleanEmail = email?.trim().toLowerCase() || undefined;

    // 1. Check if customer already exists by phone
    let customer = await this.reminderRepo.findCustomerByPhone(cleanPhone);
    if (customer) {
      return customer.id;
    }

    // 2. Check if user exists with this email
    if (cleanEmail) {
      const emailUser = await this.reminderRepo.findCustomerByEmail(cleanEmail);
      if (emailUser && emailUser.role === Role.CUSTOMER) {
        return emailUser.id;
      }
    }

    // 3. Auto-create customer in the users database so they appear in Customers section
    const sanitizedName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'cust';
    const phoneSuffix = cleanPhone.replace(/[^0-9]/g, '').slice(-4) || `${crypto.randomInt(1000, 9999)}`;
    let baseUsername = `${sanitizedName}_${phoneSuffix}`;

    // Verify username uniqueness
    let finalUsername = baseUsername;
    let attempts = 0;
    while (attempts < 10) {
      const existing = await this.reminderRepo.findCustomerByUsername(finalUsername);
      if (!existing) break;
      finalUsername = `${baseUsername}_${crypto.randomInt(10, 99)}`;
      attempts++;
    }

    // Generate random secure password for auto-created client account
    const rawPassword = `Kk@${crypto.randomBytes(6).toString('hex')}`;
    const hashedPassword = await bcrypt.hash(
      rawPassword,
      SECURITY_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );

    const newCustomer = await this.reminderRepo.createCustomerUser({
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      username: finalUsername,
      password: hashedPassword,
      role: Role.CUSTOMER,
      isEmailVerified: true,
      isActive: true,
    });

    return newCustomer.id;
  }

  async createReminder(
    dto: CreateReminderDto,
    creatorId?: string,
  ): Promise<{ message: string; reminder: ServiceReminder }> {
    if (!dto.customerName?.trim()) {
      throw new BadRequestException(REMINDER_MESSAGES.CUSTOMER_NAME_REQUIRED);
    }
    if (!dto.customerPhone?.trim()) {
      throw new BadRequestException(REMINDER_MESSAGES.CUSTOMER_PHONE_REQUIRED);
    }
    if (!dto.serviceName?.trim()) {
      throw new BadRequestException(REMINDER_MESSAGES.SERVICE_NAME_REQUIRED);
    }
    if (!dto.dueDate) {
      throw new BadRequestException(REMINDER_MESSAGES.DUE_DATE_REQUIRED);
    }

    const dueDate = new Date(dto.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new BadRequestException('Invalid due date provided');
    }

    let customerId = dto.customerId;
    // Feed customer into admin Customers database if not already linked
    if (!customerId && dto.feedCustomer !== false) {
      try {
        customerId = await this.ensureCustomerRecord(
          dto.customerName,
          dto.customerPhone,
          dto.customerEmail,
        );
      } catch (err) {
        // If customer creation fails (e.g. duplicate constraint), proceed without blocking reminder
        console.warn('Customer feed notice during reminder creation:', err);
      }
    }

    const frequency = dto.frequency || ReminderFrequency.EVERY_3_MONTHS;
    const status = dto.status || this.calculateInitialStatus(dueDate);
    const title =
      dto.title?.trim() ||
      `${dto.serviceName} - ${dto.customerName}`;

    const reminder = await this.reminderRepo.create({
      title,
      serviceName: dto.serviceName.trim(),
      service: dto.serviceId ? { connect: { id: dto.serviceId } } : undefined,
      customerName: dto.customerName.trim(),
      customerPhone: dto.customerPhone.trim(),
      customerEmail: dto.customerEmail?.trim() || null,
      customerAddress: dto.customerAddress?.trim() || null,
      frequency,
      customIntervalDays: dto.customIntervalDays || null,
      dueDate,
      lastServicedDate: dto.lastServicedDate ? new Date(dto.lastServicedDate) : null,
      status,
      notes: dto.notes?.trim() || null,
      customer: customerId ? { connect: { id: customerId } } : undefined,
      creator: creatorId ? { connect: { id: creatorId } } : undefined,
    });

    return {
      message: REMINDER_MESSAGES.REMINDER_CREATED_SUCCESS,
      reminder,
    };
  }

  async listReminders(dto: ListRemindersDto) {
    const page = Math.max(1, dto.page || 1);
    const limit = Math.max(1, Math.min(100, dto.limit || 50));
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceReminderWhereInput = {};

    if (dto.search?.trim()) {
      const term = dto.search.trim();
      where.OR = [
        { customerName: { contains: term, mode: 'insensitive' } },
        { customerPhone: { contains: term, mode: 'insensitive' } },
        { serviceName: { contains: term, mode: 'insensitive' } },
        { title: { contains: term, mode: 'insensitive' } },
        { customerAddress: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.frequency) {
      where.frequency = dto.frequency;
    }

    if (dto.serviceName?.trim()) {
      where.serviceName = { contains: dto.serviceName.trim(), mode: 'insensitive' };
    }

    // Due Filter shortcuts
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (dto.dueFilter === 'OVERDUE') {
      where.dueDate = { lt: startOfToday };
      where.status = { notIn: [ReminderStatus.COMPLETED, ReminderStatus.CANCELLED] };
    } else if (dto.dueFilter === 'DUE_TODAY') {
      where.dueDate = { gte: startOfToday, lte: endOfToday };
    } else if (dto.dueFilter === 'THIS_WEEK') {
      const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
      where.dueDate = { gte: startOfToday, lte: endOfWeek };
    } else if (dto.dueFilter === 'THIS_MONTH') {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      where.dueDate = { gte: startOfToday, lte: endOfMonth };
    }

    const [reminders, total] = await Promise.all([
      this.reminderRepo.findMany(where, skip, limit),
      this.reminderRepo.count(where),
    ]);

    // Live status recalculation for overdue items
    const updatedReminders = reminders.map((r) => {
      if (
        r.status !== ReminderStatus.COMPLETED &&
        r.status !== ReminderStatus.CANCELLED
      ) {
        if (r.dueDate < startOfToday && r.status !== ReminderStatus.OVERDUE) {
          return { ...r, status: ReminderStatus.OVERDUE };
        }
      }
      return r;
    });

    const stats = await this.reminderRepo.countByStatuses();

    return {
      data: updatedReminders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats,
    };
  }

  async getReminderById(id: string): Promise<ServiceReminder> {
    const reminder = await this.reminderRepo.findById(id);
    if (!reminder) {
      throw new NotFoundException(REMINDER_MESSAGES.REMINDER_NOT_FOUND);
    }
    return reminder;
  }

  async updateReminder(
    id: string,
    dto: UpdateReminderDto,
  ): Promise<{ message: string; reminder: ServiceReminder }> {
    const existing = await this.reminderRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(REMINDER_MESSAGES.REMINDER_NOT_FOUND);
    }

    let dueDate = existing.dueDate;
    if (dto.dueDate) {
      const parsed = new Date(dto.dueDate);
      if (!isNaN(parsed.getTime())) {
        dueDate = parsed;
      }
    }

    let customerId = dto.customerId || existing.customerId;
    if (!customerId && dto.feedCustomer !== false && (dto.customerName || dto.customerPhone)) {
      try {
        customerId = await this.ensureCustomerRecord(
          dto.customerName || existing.customerName,
          dto.customerPhone || existing.customerPhone,
          dto.customerEmail || existing.customerEmail || undefined,
        );
      } catch (err) {
        console.warn('Customer feed notice during reminder update:', err);
      }
    }

    let status = dto.status;
    if (!status && dto.dueDate) {
      status = this.calculateInitialStatus(dueDate);
    }

    const updated = await this.reminderRepo.update(id, {
      title: dto.title?.trim() ?? undefined,
      serviceName: dto.serviceName?.trim() ?? undefined,
      service: dto.serviceId ? { connect: { id: dto.serviceId } } : undefined,
      customerName: dto.customerName?.trim() ?? undefined,
      customerPhone: dto.customerPhone?.trim() ?? undefined,
      customerEmail: dto.customerEmail?.trim() ?? undefined,
      customerAddress: dto.customerAddress?.trim() ?? undefined,
      frequency: dto.frequency ?? undefined,
      customIntervalDays: dto.customIntervalDays ?? undefined,
      dueDate,
      lastServicedDate: dto.lastServicedDate ? new Date(dto.lastServicedDate) : undefined,
      status: status ?? undefined,
      notes: dto.notes?.trim() ?? undefined,
      customer: customerId ? { connect: { id: customerId } } : undefined,
    });

    return {
      message: REMINDER_MESSAGES.REMINDER_UPDATED_SUCCESS,
      reminder: updated,
    };
  }

  async completeCycleAndReschedule(
    id: string,
  ): Promise<{ message: string; reminder: ServiceReminder }> {
    const existing = await this.reminderRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(REMINDER_MESSAGES.REMINDER_NOT_FOUND);
    }

    const now = new Date();

    if (existing.frequency === ReminderFrequency.ONCE) {
      const updated = await this.reminderRepo.update(id, {
        lastServicedDate: now,
        completedDate: now,
        status: ReminderStatus.COMPLETED,
      });

      return {
        message: 'One-time reminder marked as completed',
        reminder: updated,
      };
    }

    // Calculate next cycle due date from today
    const nextDueDate = this.calculateNextDueDate(
      now,
      existing.frequency,
      existing.customIntervalDays || undefined,
    );

    const updated = await this.reminderRepo.update(id, {
      lastServicedDate: now,
      dueDate: nextDueDate,
      status: ReminderStatus.UPCOMING,
    });

    return {
      message: REMINDER_MESSAGES.REMINDER_COMPLETED_SUCCESS,
      reminder: updated,
    };
  }

  async deleteReminder(id: string): Promise<{ message: string }> {
    const existing = await this.reminderRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(REMINDER_MESSAGES.REMINDER_NOT_FOUND);
    }

    await this.reminderRepo.delete(id);
    return {
      message: REMINDER_MESSAGES.REMINDER_DELETED_SUCCESS,
    };
  }

  async getStatsSummary() {
    return this.reminderRepo.countByStatuses();
  }

  /**
   * List all services with their recurring reminder configurations and client reminder counters
   */
  async listServiceConfigs(): Promise<{
    services: (Service & { activeReminderCount: number })[];
  }> {
    const rawServices = await this.reminderRepo.findAllServicesWithReminders();

    const services = rawServices.map((svc) => ({
      ...svc,
      activeReminderCount: svc._count?.serviceReminders || 0,
    }));

    return { services };
  }

  /**
   * Update recurrence rule for a specific service (enable/disable, frequency, interval)
   */
  async updateServiceConfig(
    serviceId: string,
    dto: UpdateServiceReminderConfigDto,
  ): Promise<{ message: string; service: Service }> {
    const existing = await this.reminderRepo.findServiceByNameOrId(serviceId);
    if (!existing) {
      throw new NotFoundException('Service not found for reminder setup');
    }

    const updated = await this.reminderRepo.updateServiceReminderConfig(existing.id, {
      hasReminder: dto.hasReminder,
      reminderFrequency: dto.reminderFrequency,
      reminderIntervalDays: dto.reminderIntervalDays,
    });

    return {
      message: `Reminder setup for "${updated.name}" updated successfully`,
      service: updated,
    };
  }

  /**
   * Automatically triggered when a booked work order (ServiceEnquiry) is marked as COMPLETED.
   * Auto-schedules the next cyclic reminder for that client based on service configuration.
   */
  async handleJobCompleted(enquiry: any): Promise<ServiceReminder | null> {
    if (!enquiry || !enquiry.serviceName) {
      return null;
    }

    // 1. Identify service configuration
    const service = await this.reminderRepo.findServiceByNameOrId(enquiry.serviceName);

    const isCoconut =
      enquiry.serviceName.toLowerCase().includes('coco') ||
      enquiry.serviceName.toLowerCase().includes('palm');

    // Enabled if explicitly toggled in service, or if coconut palm harvesting (default agricultural cycle)
    const isReminderEnabled = service ? service.hasReminder : isCoconut;

    if (!isReminderEnabled) {
      return null;
    }

    // 2. Determine frequency and interval
    const frequency =
      service?.reminderFrequency ||
      (isCoconut ? ReminderFrequency.EVERY_3_MONTHS : ReminderFrequency.EVERY_3_MONTHS);
    const customDays = service?.reminderIntervalDays || undefined;

    // 3. Calculate target due date from completion date
    const completedDate = enquiry.completedAt ? new Date(enquiry.completedAt) : new Date();
    const dueDate = this.calculateNextDueDate(completedDate, frequency, customDays);

    // 4. Ensure customer account exists in customers directory
    let customerId = enquiry.customerId;
    if (!customerId && enquiry.customerName && enquiry.customerPhone) {
      try {
        customerId = await this.ensureCustomerRecord(
          enquiry.customerName,
          enquiry.customerPhone,
          enquiry.customerEmail,
        );
      } catch (err) {
        console.warn('Customer auto-feed warning during job completion reminder:', err);
      }
    }

    const addressParts = [
      enquiry.location,
      enquiry.city,
      enquiry.district,
      enquiry.state,
    ].filter(Boolean);
    const formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Kerala';

    // 5. Check if an active reminder already exists for this client & service
    const existingReminder = await this.reminderRepo.findExistingReminderByPhoneAndService(
      enquiry.customerPhone,
      enquiry.serviceName,
      service?.id,
    );

    if (existingReminder) {
      // Advance the existing reminder to the newly completed cycle
      return this.reminderRepo.update(existingReminder.id, {
        lastServicedDate: completedDate,
        dueDate,
        status: ReminderStatus.UPCOMING,
        notes: `Auto-rescheduled upon completion of Order #${enquiry.trackingNumber}`,
        enquiry: { connect: { id: enquiry.id } },
        ...(customerId ? { customer: { connect: { id: customerId } } } : {}),
      });
    }

    // 6. Create new cyclic reminder
    return this.reminderRepo.create({
      title: `Cyclic Service: ${service?.name || enquiry.serviceName}`,
      serviceName: service?.name || enquiry.serviceName,
      service: service ? { connect: { id: service.id } } : undefined,
      enquiry: { connect: { id: enquiry.id } },
      customerName: enquiry.customerName,
      customerPhone: enquiry.customerPhone,
      customerEmail: enquiry.customerEmail || undefined,
      customerAddress: formattedAddress,
      frequency,
      customIntervalDays: customDays,
      lastServicedDate: completedDate,
      dueDate,
      status: ReminderStatus.UPCOMING,
      notes: `Auto-scheduled after completion of job order #${enquiry.trackingNumber}`,
      customer: customerId ? { connect: { id: customerId } } : undefined,
    });
  }
}
