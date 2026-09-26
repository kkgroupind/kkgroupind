import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService, Role, User } from '../../../database';
import { ListStaffPeopleDto } from './dto';

@Injectable()
export class PeopleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findManyPaginated(dto: ListStaffPeopleDto) {
    const { role, search, page = 1, limit = 10 } = dto;

    const allowedRoles = role
      ? [role]
      : [Role.WORKER, Role.CUSTOMER];

    const where: Prisma.UserWhereInput = {
      role: { in: allowedRoles },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
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
        include: {
          _count: {
            select: {
              workerAssignments: true,
              customerEnquiries: true,
            },
          },
        },
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
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            workerAssignments: true,
            customerEnquiries: true,
          },
        },
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        workerAssignments: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        customerEnquiries: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findExistingUsernames(candidates: string[]): Promise<string[]> {
    if (candidates.length === 0) return [];
    const users = await this.prisma.user.findMany({
      where: {
        username: { in: candidates, mode: 'insensitive' },
      },
      select: { username: true },
    });
    return users
      .map((u) => u.username?.toLowerCase())
      .filter(Boolean) as string[];
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
