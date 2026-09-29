import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is missing in environment variables.');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Resetting all premature price and wage fields across service enquiries...');

  const enquiries = await prisma.serviceEnquiry.findMany();
  console.log(`Found ${enquiries.length} enquiries to audit.`);

  let resetCount = 0;
  for (const enq of enquiries) {
    const spec = (enq.specificationDetails as any) || {};
    const hasOfficiallySettledPayment = Boolean(spec.paymentMode && enq.status === 'COMPLETED');

    if (!hasOfficiallySettledPayment) {
      await prisma.serviceEnquiry.update({
        where: { id: enq.id },
        data: {
          unitRate: null,
          workerUnitWage: null,
          hourlyRate: null,
          totalCalculatedWage: null,
          totalCalculatedCost: null,
        },
      });
      resetCount++;
      console.log(`Reset pricing for [${enq.trackingNumber}] (Status: ${enq.status})`);
    } else {
      console.log(`Preserving finalized payout for [${enq.trackingNumber}] (₹${enq.totalCalculatedWage} via ${spec.paymentMode})`);
    }
  }

  console.log(`Successfully reset price/wage fields on ${resetCount} enquiries.`);
}

main()
  .catch((e) => {
    console.error('Failed to reset prices:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
