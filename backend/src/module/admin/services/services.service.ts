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
import { SERVICE_MESSAGES } from '../../../common';
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
  async seedDefaultServices() {
    const DEFAULT_SERVICES = [
      {
        name: 'Cococare - Palm Tree Harvesting & Maintenance',
        category: 'Agriculture',
        description:
          'Professional coconut palm tree maintenance, crown cleaning, pest control, and skilled yield harvesting by certified field climbers across Kerala.',
        features: [
          'Certified climbers with full ergonomic harness equipment',
          'Crown cleaning, dead frond pruning & rhinoceros beetle treatment',
          'Nut yield estimation and selective harvesting',
          'Organic plantation waste disposal and mulch spreading',
        ],
        icon: 'Palmtree',
        priceRange: '₹80 - ₹150 / Tree',
        duration: '1 - 3 Hours',
        sortOrder: 1,
      },
      {
        name: 'JCB Heavy Machinery & Earth Excavation',
        category: 'Excavation & Heavy Equipment',
        description:
          'High-performance JCB backhoe loaders, tracked excavators, site grading, trenching, pond restoration, and basement foundation excavation.',
        features: [
          'Verified licensed operators with 5+ years field experience',
          'Deep trench excavation, basement dig & boundary leveling',
          'Drainage channel clearing & rainwater pond development',
          'Available on hourly, daily, or turnkey project contracts',
        ],
        icon: 'Tractor',
        priceRange: '₹1,400 - ₹1,800 / Hour',
        duration: 'Shift Basis (4-8 Hours)',
        sortOrder: 2,
      },
      {
        name: 'Masonry & Brick Construction',
        category: 'Civil & Construction',
        description:
          'Master masonry crews for residential and commercial brickwork, stone foundation building, exterior plastering, and structural repairs.',
        features: [
          'Traditional Kerala stone masonry & modern cement-block laying',
          'Precision water-level alignment and plumb-line calibration',
          'Double-coat waterproof cement plastering with sand grading',
          'Architectural arches, compound walls & elevation details',
        ],
        icon: 'Layers',
        priceRange: 'Custom Project Quote',
        duration: 'Project Milestones',
        sortOrder: 3,
      },
      {
        name: 'Commercial & Residential Painting',
        category: 'Finishing & Renovation',
        description:
          'Full-scale interior and exterior painting squads with mechanized surface preparation, anti-fungal treatment, and weather-guard coating.',
        features: [
          'High-pressure water jet washing & acrylic putty skimming',
          'Weather-proof exterior emulsion with 5-year anti-algal warranty',
          'Interior luxury velvet & royal sheen roller application',
          'Authentic Asian Paints, Berger, and Dulux certified materials',
        ],
        icon: 'Paintbrush',
        priceRange: '₹18 - ₹35 / Sq. Ft.',
        duration: '3 - 7 Days',
        sortOrder: 4,
      },
      {
        name: 'Tile, Marble & Granite Laying',
        category: 'Flooring & Surfaces',
        description:
          'Precision floor, wall, and bathroom tiling squads specialized in large-format vitrified tiles, natural granite slabs, and Italian marble installation.',
        features: [
          'Laser-guided leveling with anti-lippage spacer systems',
          'Epoxy waterproof grout filling for chemical resistance',
          'Diamond abrasive pad polishing and edge chamfering',
          'Staircase bullnosing & custom kitchen countertop fabrication',
        ],
        icon: 'Sparkles',
        priceRange: '₹28 - ₹65 / Sq. Ft.',
        duration: '2 - 5 Days',
        sortOrder: 5,
      },
      {
        name: 'Electrical & Wiring Systems',
        category: 'MEP & Utilities',
        description:
          'Licensed wiremen and industrial electricians for complete concealed conduit wiring, main DB dressing, solar grid tie-ins, and three-phase balancing.',
        features: [
          'Kerala State Electricity Board (KSEB) compliant standards',
          'FR-LSH copper cabling with MCB/ELCB surge protection',
          'Copper plate earth pit installation with chemical backfill',
          'Generator changeover switches, UPS & high-load AC points',
        ],
        icon: 'Zap',
        priceRange: '₹450 Base / Point-based',
        duration: 'Same Day / Project',
        sortOrder: 6,
      },
      {
        name: 'Plumbing & High-Pressure Piping',
        category: 'MEP & Utilities',
        description:
          'Turnkey plumbing installations, CPVC/UPVC pressurized water lines, underground drainage networks, overhead tank setups, and fixture installations.',
        features: [
          'Electrofusion & solvent weld joints with hydrostatic testing',
          'Overhead multi-layer tank installation with automatic float valves',
          'Concealed diverters, shower columns & sanitary ware fixing',
          'Submersible pump wiring & rainwater harvesting connections',
        ],
        icon: 'Wrench',
        priceRange: '₹350 Visit / Estimate',
        duration: 'Same Day Dispatch',
        sortOrder: 7,
      },
      {
        name: 'Borewell Drilling & Water Testing',
        category: 'Water & Irrigation',
        description:
          'Advanced rotary and DTH rig borewell drilling, geophysical water vein surveys, MS/PVC casing pipe insertion, and accredited lab water potability tests.',
        features: [
          'Geological sensor scanning for optimal aquifer detection',
          'High-diameter heavy rig drilling up to 1,200 ft depth',
          'Food-grade heavy wall casing pipes with pea gravel packing',
          'Certified 16-parameter chemical & microbiological water report',
        ],
        icon: 'Droplets',
        priceRange: '₹95 - ₹140 / Foot',
        duration: '1 - 2 Days',
        sortOrder: 8,
      },
    ];

    const results: Service[] = [];
    for (const def of DEFAULT_SERVICES) {
      const existing = await this.servicesRepo.findBySlug(this.generateSlug(def.name));
      if (!existing) {
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
