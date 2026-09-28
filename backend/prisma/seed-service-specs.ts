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

  for (const def of KK_STANDARD_SERVICE_SPECS) {
    const slug = generateSlug(def.name);
    const expectedServiceId = `KKS-${String(def.sortOrder).padStart(3, '0')}`;

    // Try finding by serviceId first, then by slug
    let existing = await prisma.service.findUnique({
      where: { serviceId: expectedServiceId },
    });

    if (!existing) {
      existing = await prisma.service.findUnique({
        where: { slug },
      });
    }

    if (existing) {
      console.log(`Updating service [${expectedServiceId}]: "${def.name}" (${def.category})`);
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          serviceId: expectedServiceId,
          name: def.name,
          slug,
          category: def.category,
          description: def.description,
          features: def.features,
          icon: def.icon,
          image: def.image,
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
      console.log(`Creating new service [${expectedServiceId}]: "${def.name}" (${def.category})`);
      await prisma.service.create({
        data: {
          serviceId: expectedServiceId,
          name: def.name,
          slug,
          category: def.category,
          description: def.description,
          features: def.features,
          icon: def.icon,
          image: def.image,
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
