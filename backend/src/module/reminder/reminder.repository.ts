import { Injectable } from '@nestjs/common';
import {
  Prisma,
  PrismaService,
  ReminderStatus,
  ReminderFrequency,
  Role,
  ServiceReminder,
  Service,
  User,
} from '../../database';

@Injectable()
export class ReminderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ServiceReminderCreateInput): Promise<ServiceReminder> {
    return this.prisma.serviceReminder.create({
      data,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            username: true,
            phone: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findMany(
    where: Prisma.ServiceReminderWhereInput,
    skip = 0,
    take = 50,
  ): Promise<ServiceReminder[]> {
    return this.prisma.serviceReminder.findMany({
      where,
      skip,
      take,
      orderBy: {
        dueDate: 'asc',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            username: true,
            phone: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async count(where: Prisma.ServiceReminderWhereInput): Promise<number> {
    return this.prisma.serviceReminder.count({ where });
  }

  async findById(id: string): Promise<ServiceReminder | null> {
    return this.prisma.serviceReminder.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            username: true,
            phone: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.ServiceReminderUpdateInput,
  ): Promise<ServiceReminder> {
    return this.prisma.serviceReminder.update({
      where: { id },
      data,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            username: true,
            phone: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<ServiceReminder> {
    return this.prisma.serviceReminder.delete({
      where: { id },
    });
  }

  async findCustomerByPhone(phone: string): Promise<User | null> {
    const cleanPhone = phone.trim();
    return this.prisma.user.findFirst({
      where: {
        phone: cleanPhone,
        role: Role.CUSTOMER,
      },
    });
  }

  async findUserByPhoneAnyRole(phone: string): Promise<User | null> {
    const cleanPhone = phone.trim();
    return this.prisma.user.findFirst({
      where: {
        phone: cleanPhone,
      },
    });
  }

  async findCustomerByEmail(email: string): Promise<User | null> {
    const cleanEmail = email.trim().toLowerCase();
    return this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });
  }

  async findCustomerByUsername(username: string): Promise<User | null> {
    const cleanUsername = username.trim().toLowerCase();
    return this.prisma.user.findUnique({
      where: { username: cleanUsername },
    });
  }

  async createCustomerUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async countByStatuses(): Promise<{
    total: number;
    upcoming: number;
    due: number;
    overdue: number;
    completed: number;
  }> {
    const [total, upcoming, due, overdue, completed] = await Promise.all([
      this.prisma.serviceReminder.count(),
      this.prisma.serviceReminder.count({
        where: { status: ReminderStatus.UPCOMING },
      }),
      this.prisma.serviceReminder.count({
        where: { status: ReminderStatus.DUE },
      }),
      this.prisma.serviceReminder.count({
        where: { status: ReminderStatus.OVERDUE },
      }),
      this.prisma.serviceReminder.count({
        where: { status: ReminderStatus.COMPLETED },
      }),
    ]);

    return { total, upcoming, due, overdue, completed };
  }

  async findServiceByNameOrId(nameOrId: string): Promise<Service | null> {
    const trimmed = nameOrId.trim();
    // 1. Direct match by id or serviceId
    let service = await this.prisma.service.findFirst({
      where: {
        OR: [
          { id: trimmed },
          { serviceId: trimmed },
          { slug: trimmed.toLowerCase() },
          { name: { equals: trimmed, mode: 'insensitive' } },
        ],
      },
    });

    if (service) return service;

    // 2. Substring matching (e.g. "coconut" matches "Coconut Palm Tree Plucking & Crown Cleaning")
    const words = trimmed.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    for (const word of words) {
      service = await this.prisma.service.findFirst({
        where: {
          name: { contains: word, mode: 'insensitive' },
        },
      });
      if (service) return service;
    }

    return null;
  }

  async findAllServicesWithReminders(): Promise<
    (Service & { _count: { serviceReminders: number } })[]
  > {
    return this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            serviceReminders: true,
          },
        },
      },
    });
  }

  async updateServiceReminderConfig(
    serviceId: string,
    data: {
      hasReminder?: boolean;
      reminderFrequency?: ReminderFrequency;
      reminderIntervalDays?: number | null;
    },
  ): Promise<Service> {
    return this.prisma.service.update({
      where: { id: serviceId },
      data: {
        hasReminder: data.hasReminder,
        reminderFrequency: data.reminderFrequency,
        reminderIntervalDays: data.reminderIntervalDays,
      },
    });
  }

  async findExistingReminderByPhoneAndService(
    phone: string,
    serviceName: string,
    serviceId?: string,
  ): Promise<ServiceReminder | null> {
    const cleanPhone = phone.trim();
    return this.prisma.serviceReminder.findFirst({
      where: {
        customerPhone: cleanPhone,
        OR: [
          ...(serviceId ? [{ serviceId }] : []),
          { serviceName: { equals: serviceName.trim(), mode: 'insensitive' as Prisma.QueryMode } },
        ],
        status: { in: [ReminderStatus.UPCOMING, ReminderStatus.DUE, ReminderStatus.OVERDUE] },
      },
      orderBy: { dueDate: 'desc' },
    });
  }
}
