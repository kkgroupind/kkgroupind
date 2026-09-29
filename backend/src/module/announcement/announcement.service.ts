import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, TargetAudience, Role } from '../../database';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AnnouncementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(userId: string, dto: CreateAnnouncementDto) {
    const announcement = await this.prisma.announcement.create({
      data: {
        ...dto,
        createdById: userId,
      },
    });

    await this.auditService.recordLog({
      userId,
      action: 'CREATE',
      entityType: 'ANNOUNCEMENT',
      entityId: announcement.id,
      details: `Created announcement: ${announcement.title}`,
    });

    return announcement;
  }

  async findAllForAdmin() {
    return this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { name: true, username: true, role: true },
        },
      },
    });
  }

  async findAllForUser(role: Role) {
    // Map User Role to TargetAudience
    let audience: TargetAudience[] = [TargetAudience.ALL];
    
    if (role === Role.WORKER) {
      audience.push(TargetAudience.WORKERS);
    } else if (role === Role.CUSTOMER) {
      audience.push(TargetAudience.CUSTOMERS);
    } else if (role === Role.OFFICE_STAFF) {
      audience.push(TargetAudience.OFFICE_STAFF);
    }

    return this.prisma.announcement.findMany({
      where: {
        isPublished: true,
        target: { in: audience },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { name: true, username: true },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Announcement not found');
    }

    await this.prisma.announcement.delete({ where: { id } });

    await this.auditService.recordLog({
      userId,
      action: 'DELETE',
      entityType: 'ANNOUNCEMENT',
      entityId: id,
      details: `Deleted announcement: ${existing.title}`,
    });

    return { message: 'Announcement deleted successfully' };
  }
}
