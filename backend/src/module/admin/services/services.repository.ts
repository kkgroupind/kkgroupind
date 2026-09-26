import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService, Service } from '../../../database';

@Injectable()
export class ServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ServiceCreateInput): Promise<Service> {
    return this.prisma.service.create({ data });
  }

  async createMany(data: Prisma.ServiceCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return this.prisma.service.createMany({ data, skipDuplicates: true });
  }

  async findMany(params: {
    where?: Prisma.ServiceWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.ServiceOrderByWithRelationInput | Prisma.ServiceOrderByWithRelationInput[];
  }): Promise<Service[]> {
    const { where, skip, take, orderBy } = params;
    return this.prisma.service.findMany({
      where,
      skip,
      take,
      orderBy: orderBy || [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async count(where?: Prisma.ServiceWhereInput): Promise<number> {
    return this.prisma.service.count({ where });
  }

  async findById(id: string): Promise<Service | null> {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async findByServiceId(serviceId: string): Promise<Service | null> {
    return this.prisma.service.findUnique({ where: { serviceId } });
  }

  async findBySlug(slug: string): Promise<Service | null> {
    return this.prisma.service.findUnique({ where: { slug } });
  }

  async findAllServiceIds(): Promise<string[]> {
    const services = await this.prisma.service.findMany({
      select: { serviceId: true },
    });
    return services.map((s) => s.serviceId);
  }

  async findExistingSlugs(slugs: string[]): Promise<string[]> {
    if (slugs.length === 0) return [];
    const services = await this.prisma.service.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true },
    });
    return services.map((s) => s.slug);
  }

  async update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Service> {
    return this.prisma.service.delete({
      where: { id },
    });
  }
}
