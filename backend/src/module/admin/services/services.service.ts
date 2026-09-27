import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ServicesRepository } from './services.repository';
import { CreateServiceDto, ListServicesDto, UpdateServiceDto } from './dto';
import { SERVICE_MESSAGES, KK_STANDARD_SERVICE_SPECS } from '../../../common';
import { Prisma, Service } from '../../../database';

@Injectable()
export class ServicesService implements OnModuleInit {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private readonly servicesRepo: ServicesRepository) {}

  async onModuleInit() {
    // Auto-seed KK Group catalog if empty
    try {
      const count = await this.servicesRepo.count();
      if (count === 0) {
        this.logger.log('Services table is empty. Initializing KK Group services catalog...');
        await this.seedDefaultServices();
      }
    } catch (err) {
      this.logger.warn(`Could not verify or auto-seed services: ${err?.message || err}`);
    }
  }

  /**
   * Deterministic Unique Alphanumeric Sequence Algorithm:
   * Extracts the highest numerical suffix matching prefix (e.g. "KKS-007" -> 7).
   * Generates next padded code e.g. "KKS-008", defensively checking uniqueness.
   */
  async generateNextServiceId(prefix = 'KKS'): Promise<string> {
    const cleanPrefix = prefix.trim().toUpperCase();
    const existingIds = await this.servicesRepo.findAllServiceIds();

    const regex = new RegExp(`^${cleanPrefix}-(\\d+)$`, 'i');
    let maxNumber = 0;

    for (const id of existingIds) {
      const match = id.match(regex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    let nextNum = maxNumber + 1;
    let candidate = `${cleanPrefix}-${String(nextNum).padStart(3, '0')}`;

    const existingIdSet = new Set(existingIds.map((id) => id.toUpperCase()));
    while (existingIdSet.has(candidate.toUpperCase())) {
      nextNum++;
      candidate = `${cleanPrefix}-${String(nextNum).padStart(3, '0')}`;
    }

    return candidate;
  }

  /**
   * Generate slug from name with collision resolution
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async getUniqueSlug(baseName: string, excludeId?: string): Promise<string> {
    const baseSlug = this.generateSlug(baseName) || 'service';
    let candidate = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.servicesRepo.findBySlug(candidate);
      if (!existing || existing.id === excludeId) {
        return candidate;
      }
      counter++;
      candidate = `${baseSlug}-${counter}`;
    }
  }

  async createService(dto: CreateServiceDto) {
    const name = dto.name?.trim();
    if (!name) {
      throw new BadRequestException(SERVICE_MESSAGES.NAME_REQUIRED);
    }

    // Generate or validate unique serviceId
    let finalServiceId: string;
    if (dto.serviceId?.trim()) {
      const candidateId = dto.serviceId.trim().toUpperCase();
      const existing = await this.servicesRepo.findByServiceId(candidateId);
      if (existing) {
        throw new ConflictException(SERVICE_MESSAGES.SERVICE_ID_ALREADY_EXISTS);
      }
      finalServiceId = candidateId;
    } else {
      finalServiceId = await this.generateNextServiceId();
    }

    // Generate unique slug
    const finalSlug = dto.slug?.trim()
      ? await this.getUniqueSlug(dto.slug)
      : await this.getUniqueSlug(name);

    const service = await this.servicesRepo.create({
      serviceId: finalServiceId,
      name,
      slug: finalSlug,
      category: dto.category?.trim() || 'General',
      description: dto.description.trim(),
      features: dto.features || [],
      icon: dto.icon?.trim() || null,
      image: dto.image?.trim() || null,
      priceRange: dto.priceRange?.trim() || null,
      duration: dto.duration?.trim() || null,
      wageType: dto.wageType?.trim() || 'HOURLY',
      unitLabel: dto.unitLabel?.trim() || 'Hour',
      baseCustomerRate: dto.baseCustomerRate !== undefined && dto.baseCustomerRate !== null ? Number(dto.baseCustomerRate) : null,
      baseWorkerWage: dto.baseWorkerWage !== undefined && dto.baseWorkerWage !== null ? Number(dto.baseWorkerWage) : null,
      minUnits: dto.minUnits !== undefined && dto.minUnits !== null ? Number(dto.minUnits) : 1,
      specifications: dto.specifications ?? null,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });

    return {
      message: SERVICE_MESSAGES.SERVICE_CREATED_SUCCESS,
      service,
    };
  }

  async listServices(dto: ListServicesDto) {
    const { search, category, isActive, page = 1, limit = 20 } = dto;
    const where: Prisma.ServiceWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { serviceId: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { category: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (category && category.trim()) {
      where.category = { equals: category.trim(), mode: 'insensitive' };
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.servicesRepo.count(where),
      this.servicesRepo.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getServiceById(idOrServiceId: string) {
    let service = await this.servicesRepo.findById(idOrServiceId);
    if (!service) {
      service = await this.servicesRepo.findByServiceId(idOrServiceId.toUpperCase());
    }
    if (!service) {
      service = await this.servicesRepo.findBySlug(idOrServiceId.toLowerCase());
    }

    if (!service) {
      throw new NotFoundException(SERVICE_MESSAGES.SERVICE_NOT_FOUND);
    }

    return service;
  }

  async updateService(id: string, dto: UpdateServiceDto) {
    const service = await this.servicesRepo.findById(id);
    if (!service) {
      throw new NotFoundException(SERVICE_MESSAGES.SERVICE_NOT_FOUND);
    }

    const data: Prisma.ServiceUpdateInput = {};

    if (dto.name !== undefined) {
      const finalName = dto.name.trim();
      if (!finalName) {
        throw new BadRequestException(SERVICE_MESSAGES.NAME_REQUIRED);
      }
      data.name = finalName;
    }

    if (dto.serviceId !== undefined) {
      const candidateId = dto.serviceId.trim().toUpperCase();
      if (candidateId !== service.serviceId) {
        const existing = await this.servicesRepo.findByServiceId(candidateId);
        if (existing && existing.id !== id) {
          throw new ConflictException(SERVICE_MESSAGES.SERVICE_ID_ALREADY_EXISTS);
        }
        data.serviceId = candidateId;
      }
    }

    if (dto.slug !== undefined) {
      const candidateSlug = dto.slug.trim().toLowerCase();
      if (candidateSlug !== service.slug) {
        const uniqueSlug = await this.getUniqueSlug(candidateSlug, id);
        data.slug = uniqueSlug;
      }
    } else if (dto.name && dto.name !== service.name) {
      data.slug = await this.getUniqueSlug(dto.name, id);
    }

    if (dto.category !== undefined) {
      data.category = dto.category.trim() || 'General';
    }

    if (dto.description !== undefined) {
      const desc = dto.description.trim();
      if (!desc) {
        throw new BadRequestException(SERVICE_MESSAGES.DESCRIPTION_REQUIRED);
      }
      data.description = desc;
    }

    if (dto.features !== undefined) {
      data.features = dto.features;
    }

    if (dto.icon !== undefined) {
      data.icon = dto.icon?.trim() || null;
    }

    if (dto.image !== undefined) {
      data.image = dto.image?.trim() || null;
    }

    if (dto.priceRange !== undefined) {
      data.priceRange = dto.priceRange?.trim() || null;
    }

    if (dto.duration !== undefined) {
      data.duration = dto.duration?.trim() || null;
    }

    if (dto.wageType !== undefined) {
      data.wageType = dto.wageType?.trim() || 'HOURLY';
    }

    if (dto.unitLabel !== undefined) {
      data.unitLabel = dto.unitLabel?.trim() || 'Hour';
    }

    if (dto.baseCustomerRate !== undefined) {
      data.baseCustomerRate = dto.baseCustomerRate !== null ? Number(dto.baseCustomerRate) : null;
    }

    if (dto.baseWorkerWage !== undefined) {
      data.baseWorkerWage = dto.baseWorkerWage !== null ? Number(dto.baseWorkerWage) : null;
    }

    if (dto.minUnits !== undefined) {
      data.minUnits = dto.minUnits !== null ? Number(dto.minUnits) : 1;
    }

    if (dto.specifications !== undefined) {
      data.specifications = dto.specifications;
    }

    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }

    const updated = await this.servicesRepo.update(id, data);
    return {
      message: SERVICE_MESSAGES.SERVICE_UPDATED_SUCCESS,
      service: updated,
    };
  }

  async toggleServiceStatus(id: string) {
    const service = await this.servicesRepo.findById(id);
    if (!service) {
      throw new NotFoundException(SERVICE_MESSAGES.SERVICE_NOT_FOUND);
    }

    const updated = await this.servicesRepo.update(id, {
      isActive: !service.isActive,
    });

    return {
      message: SERVICE_MESSAGES.SERVICE_STATUS_UPDATED,
      service: updated,
    };
  }

  async deleteService(id: string) {
    const service = await this.servicesRepo.findById(id);
    if (!service) {
      throw new NotFoundException(SERVICE_MESSAGES.SERVICE_NOT_FOUND);
    }

    await this.servicesRepo.delete(id);
    return {
      message: SERVICE_MESSAGES.SERVICE_DELETED_SUCCESS,
    };
  }

  /**
   * Seed KK Group default operational services
   */
  /**
   * Seed KK Group default operational services with full unit specifications
   */
  async seedDefaultServices() {
    const results: Service[] = [];
    for (const def of KK_STANDARD_SERVICE_SPECS) {
      const existing =
        (await this.servicesRepo.findBySlug(this.generateSlug(def.name))) ||
        (await this.servicesRepo.findMany({
          where: { name: { contains: def.name.split(' ')[0], mode: 'insensitive' } },
          take: 1,
        })).at(0);

      if (existing) {
        // Upgrade existing service with full unit specifications
        const updated = await this.servicesRepo.update(existing.id, {
          category: def.category,
          description: def.description,
          features: def.features,
          icon: def.icon,
          priceRange: def.priceRange,
          duration: def.duration,
          wageType: def.wageType,
          unitLabel: def.unitLabel,
          baseCustomerRate: def.baseCustomerRate,
          baseWorkerWage: def.baseWorkerWage,
          minUnits: def.minUnits,
          specifications: def.specifications,
          sortOrder: def.sortOrder,
        });
        results.push(updated);
      } else {
        const serviceId = await this.generateNextServiceId();
        const slug = await this.getUniqueSlug(def.name);
        const created = await this.servicesRepo.create({
          serviceId,
          name: def.name,
          slug,
          category: def.category,
          description: def.description,
          features: def.features,
          icon: def.icon,
          priceRange: def.priceRange,
          duration: def.duration,
          wageType: def.wageType,
          unitLabel: def.unitLabel,
          baseCustomerRate: def.baseCustomerRate,
          baseWorkerWage: def.baseWorkerWage,
          minUnits: def.minUnits,
          specifications: def.specifications,
          sortOrder: def.sortOrder,
          isActive: true,
        });
        results.push(created);
      }
    }

    return {
      message: SERVICE_MESSAGES.SERVICE_SEEDED_SUCCESS,
      count: results.length,
      services: results,
    };
  }
}
