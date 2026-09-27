import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { resolveServiceSpec } from '../src/common/constants/service-specs.constant';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is missing in environment variables.');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Synchronizing all service enquiries with their true service specifications...');

  const enquiries = await prisma.serviceEnquiry.findMany();
  console.log(`Found ${enquiries.length} enquiries to audit and synchronize.`);

  for (const enq of enquiries) {
    const spec = resolveServiceSpec(enq.serviceName, enq.wageType);
    console.log(
      `Enquiry "${enq.trackingNumber}" (${enq.serviceName}) -> ${spec.wageType} [${spec.unitLabel}] (Worker: ₹${spec.baseWorkerWage}, Customer: ₹${spec.baseCustomerRate})`
    );

    await prisma.serviceEnquiry.update({
      where: { id: enq.id },
      data: {
        wageType: spec.wageType,
        unitLabel: spec.unitLabel,
        unitRate: enq.unitRate || spec.baseCustomerRate,
        workerUnitWage: enq.workerUnitWage || spec.baseWorkerWage,
        minUnits: enq.minUnits || spec.minUnits,
        isHourlyCalculated: spec.wageType === 'HOURLY',
      },
    });
  }

  console.log('All service enquiries successfully synchronized to their respective service classification!');
}

main()
  .catch((e) => {
    console.error('Sync failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
