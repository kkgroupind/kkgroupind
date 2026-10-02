import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService, Role, User } from '../../../database';
import { normalizePhoneNumber, extractCorePhone } from '../../../common';
import { ListPeopleDto } from './dto';

@Injectable()
export class PeopleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findMany(role?: Role): Promise<User[]> {
    const where: Prisma.UserWhereInput = role
      ? { role }
      : { role: { in: [Role.WORKER, Role.OFFICE_STAFF, Role.CUSTOMER] } };
    return this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findManyPaginated(dto: ListPeopleDto) {
    const { role, search, page = 1, limit = 10 } = dto;
    
    const where: Prisma.UserWhereInput = {
      ...(role
        ? { role }
        : { role: { in: [Role.WORKER, Role.OFFICE_STAFF, Role.CUSTOMER] } }),
      ...(search && {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const skip = (page - 1) * limit;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        attendances: {
          orderBy: { date: 'desc' },
          take: 60,
        },
        officeEnquiries: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            worker: {
              select: {
                id: true,
                name: true,
                username: true,
                phone: true,
                avatar: true,
              },
            },
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        workerAssignments: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
            officeStaff: {
              select: {
                id: true,
                name: true,
                username: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            attendances: true,
            officeEnquiries: true,
            workerAssignments: true,
          },
        },
      },
    });

    if (user && user.role === Role.WORKER) {
      try {
        const squadJobs = await this.prisma.serviceEnquiry.findMany({
          where: {
            specificationDetails: {
              path: ['squadWorkerIds'],
              array_contains: user.id,
            },
            workerId: { not: user.id },
          },
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
            officeStaff: {
              select: {
                id: true,
                name: true,
                username: true,
                phone: true,
                avatar: true,
              },
            },
          },
        });

        if (squadJobs && squadJobs.length > 0) {
          const existingIds = new Set((user.workerAssignments || []).map((j) => j.id));
          const uniqueSquadJobs = squadJobs.filter((j) => !existingIds.has(j.id));
          const merged = [...(user.workerAssignments || []), ...uniqueSquadJobs];
          merged.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          (user as any).workerAssignments = merged;
          if (user._count) {
            user._count.workerAssignments = merged.length;
          }
        }
      } catch (err) {
        // Safe fallback
      }
    }

    if (user && user.role === Role.CUSTOMER) {
      try {
        const cleanPhone = user.phone?.trim();
        const cleanEmail = user.email?.trim().toLowerCase();
        const normalized = cleanPhone ? normalizePhoneNumber(cleanPhone) : undefined;
        const coreDigits = cleanPhone ? extractCorePhone(cleanPhone) : undefined;

        const phoneMatches: Prisma.ServiceEnquiryWhereInput[] = [
          ...(normalized ? [{ customerPhone: normalized }] : []),
          ...(cleanPhone ? [{ customerPhone: cleanPhone }] : []),
          ...(coreDigits && coreDigits.length >= 7 ? [{ customerPhone: { endsWith: coreDigits } }] : []),
          ...(cleanEmail ? [{ customerEmail: cleanEmail }] : []),
        ];

        const [enquiries, reminders] = await Promise.all([
          this.prisma.serviceEnquiry.findMany({
            where: {
              OR: [
                { customerId: user.id },
                ...phoneMatches,
              ],
            },
            orderBy: { createdAt: 'desc' },
            take: 500,
            include: {
              worker: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  phone: true,
                  avatar: true,
                  workerStatus: true,
                },
              },
              officeStaff: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  phone: true,
                  avatar: true,
                },
              },
              financialTransactions: true,
            },
          }),
          this.prisma.serviceReminder.findMany({
            where: {
              OR: [
                { customerId: user.id },
                ...(normalized ? [{ customerPhone: normalized }] : []),
                ...(cleanPhone ? [{ customerPhone: cleanPhone }] : []),
                ...(coreDigits && coreDigits.length >= 7 ? [{ customerPhone: { endsWith: coreDigits } }] : []),
                ...(cleanEmail ? [{ customerEmail: cleanEmail }] : []),
              ],
            },
            orderBy: { dueDate: 'asc' },
            take: 200,
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  category: true,
                  image: true,
                  hasReminder: true,
                  reminderFrequency: true,
                  reminderIntervalDays: true,
                },
              },
            },
          }),
        ]);

        const completedJobs = enquiries.filter((e) => e.status === 'COMPLETED');
        const totalSpent = completedJobs.reduce((sum, e) => sum + (e.totalCalculatedCost || 0), 0);
        const activeReminders = reminders.filter((r) => r.status !== 'COMPLETED').length;

        (user as any).customerEnquiries = enquiries;
        (user as any).customerReminders = reminders;
        (user as any).customerStats = {
          totalEnquiries: enquiries.length,
          completedWorks: completedJobs.length,
          totalSpent,
          activeReminders,
        };

        if (user._count) {
          (user._count as any).customerEnquiries = enquiries.length;
          (user._count as any).customerReminders = reminders.length;
        }

        // Auto-heal orphan enquiries by phone or email in background
        if (phoneMatches.length > 0) {
          this.prisma.serviceEnquiry.updateMany({
            where: {
              AND: [
                { OR: [{ customerId: null }, { customerId: '' }] },
                { OR: phoneMatches },
              ],
            },
            data: {
              customerId: user.id,
              ...(normalized ? { customerPhone: normalized } : {}),
            },
          }).catch(() => null);
        }
      } catch (err) {
        // Safe fallback
      }
    }

    return user as any;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findCustomerByPhoneOrEmail(phone?: string, email?: string): Promise<User | null> {
    if (!phone && !email) return null;
    const cleanPhone = phone?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const normalized = cleanPhone ? normalizePhoneNumber(cleanPhone) : undefined;
    const coreDigits = cleanPhone ? extractCorePhone(cleanPhone) : undefined;

    return this.prisma.user.findFirst({
      where: {
        role: Role.CUSTOMER,
        OR: [
          ...(normalized ? [{ phone: normalized }] : []),
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
          ...(coreDigits && coreDigits.length >= 7 ? [{ phone: { endsWith: coreDigits } }] : []),
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ],
      },
    });
  }

  async searchCustomers(query: string): Promise<
    { id: string; name: string | null; phone: string | null; email: string | null; address: string | null }[]
  > {
    const term = query?.trim();
    const normalizedPhone = term ? normalizePhoneNumber(term) : undefined;
    const coreDigits = term ? extractCorePhone(term) : undefined;
    const mode: Prisma.QueryMode = 'insensitive';

    const orConditions: Prisma.UserWhereInput[] = [];
    if (term) {
      orConditions.push(
        { name: { contains: term, mode } },
        { phone: { contains: term, mode } },
        { email: { contains: term, mode } },
        { username: { contains: term, mode } },
        { address: { contains: term, mode } },
      );
      if (normalizedPhone) {
        orConditions.push({ phone: { contains: normalizedPhone, mode } });
      }
      if (coreDigits && coreDigits.length >= 3) {
        orConditions.push({ phone: { contains: coreDigits, mode } });
      }
    }

    const where: Prisma.UserWhereInput = {
      role: Role.CUSTOMER,
      ...(term ? { OR: orConditions } : {}),
    };

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveWorkers(): Promise<
    { id: string; name: string | null; phone: string | null; workerStatus: any; avatar: string | null }[]
  > {
    return this.prisma.user.findMany({
      where: {
        role: Role.WORKER,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        workerStatus: true,
        avatar: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async linkOrphanEnquiriesToCustomer(customerId: string, phone?: string, email?: string): Promise<void> {
    const cleanPhone = phone?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanPhone && !cleanEmail) return;

    await this.prisma.serviceEnquiry.updateMany({
      where: {
        customerId: null,
        OR: [
          ...(cleanPhone ? [{ customerPhone: cleanPhone }] : []),
          ...(cleanEmail ? [{ customerEmail: cleanEmail }] : []),
        ],
      },
      data: { customerId },
    }).catch(() => null);
  }

  async createServiceEnquiry(data: Prisma.ServiceEnquiryCreateInput) {
    return this.prisma.serviceEnquiry.create({
      data,
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        worker: { select: { id: true, name: true, phone: true, workerStatus: true } },
      },
    });
  }

  async findExistingUsernames(candidates: string[]): Promise<string[]> {
    if (candidates.length === 0) return [];
    const users = await this.prisma.user.findMany({
      where: {
        username: { in: candidates, mode: 'insensitive' },
      },
      select: { username: true },
    });
    return users.map((u) => u.username?.toLowerCase()).filter(Boolean) as string[];
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
