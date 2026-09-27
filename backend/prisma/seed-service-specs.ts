import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { KK_STANDARD_SERVICE_SPECS } from '../src/common/constants/service-specs.constant';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is missing in environment variables.');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log('Synchronizing KK Group Service Specifications with Database...');

  let serviceCounter = 1;
  const existingServices = await prisma.service.findMany();
  const existingIds = existingServices.map((s) => s.serviceId);

  for (const def of KK_STANDARD_SERVICE_SPECS) {
    const slug = generateSlug(def.name);
    // Find by exact slug, name substring, or category match
    const existing = existingServices.find(
      (s) =>
        s.slug === slug ||
        s.name.toLowerCase().includes(def.name.split(' ')[0].toLowerCase()) ||
        (s.category && s.category.toLowerCase() === def.category.toLowerCase()),
    );

    if (existing) {
      console.log(`Updating existing service: "${existing.name}" -> Wage: ${def.wageType} (${def.unitLabel})`);
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          name: def.name,
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
        },
      });
    } else {
      let finalServiceId = `KKS-${String(serviceCounter).padStart(3, '0')}`;
      while (existingIds.includes(finalServiceId)) {
        serviceCounter++;
        finalServiceId = `KKS-${String(serviceCounter).padStart(3, '0')}`;
      }
      existingIds.push(finalServiceId);

      console.log(`Creating new service: "${def.name}" -> ${finalServiceId} (${def.wageType})`);
      await prisma.service.create({
        data: {
          serviceId: finalServiceId,
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
        },
      });
      serviceCounter++;
    }
  }

  console.log('All KK Group service specifications successfully synchronized in database!');
}

main()
  .catch((e) => {
    console.error('Error seeding service specifications:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
