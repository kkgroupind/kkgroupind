import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is missing.');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function seed() {
  console.log('Seeding initial finance transactions and audit logs...');

  // 1. Fetch Admin and Staff
  const admin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  const staff = await prisma.user.findFirst({
    where: { role: 'OFFICE_STAFF' },
  });

  const worker = await prisma.user.findFirst({
    where: { role: 'WORKER' },
  });

  if (!admin) {
    console.log('No super admin found. Run base seed first.');
    return;
  }

  const actorId = staff ? staff.id : admin.id;

  const existingCount = await prisma.financialTransaction.count();
  if (existingCount > 0) {
    console.log(`Transactions already exist (${existingCount}). Skipping seeding.`);
    return;
  }

  const sampleData = [
    {
      transactionNumber: 'TXN-20260920-0001',
      type: 'INCOME' as const,
      category: 'ADVANCE_PAYMENT' as const,
      amount: 15000,
      date: new Date('2026-09-20T10:30:00Z'),
      dateString: '2026-09-20',
      paymentMethod: 'UPI' as const,
      status: 'VERIFIED' as const,
      referenceNumber: 'UPI/2938472918',
      serviceType: 'JCB Heavy Machinery & Earth Excavation',
      customerName: 'Santhosh Kumar (Kanhangad)',
      notes: 'Advance booking for 12 hours site leveling in Kanhangad',
      recordedById: admin.id,
      verifiedById: admin.id,
    },
    {
      transactionNumber: 'TXN-20260920-0002',
      type: 'EXPENSE' as const,
      category: 'FUEL_DIESEL' as const,
      amount: 4500,
      date: new Date('2026-09-20T14:15:00Z'),
      dateString: '2026-09-20',
      paymentMethod: 'CASH' as const,
      status: 'VERIFIED' as const,
      referenceNumber: 'HP-FUEL-8492',
      serviceType: 'JCB Heavy Machinery & Earth Excavation',
      vendorName: 'HP Fuel Station Nileshwar',
      notes: '50 Litres Diesel for JCB KL-60-A-4122',
      recordedById: actorId,
      verifiedById: admin.id,
    },
    {
      transactionNumber: 'TXN-20260922-0001',
      type: 'INCOME' as const,
      category: 'SERVICE_PAYMENT' as const,
      amount: 8500,
      date: new Date('2026-09-22T11:00:00Z'),
      dateString: '2026-09-22',
      paymentMethod: 'BANK_TRANSFER' as const,
      status: 'VERIFIED' as const,
      referenceNumber: 'NEFT-SBIN0029381',
      serviceType: 'Cococare - Palm Tree Harvesting & Maintenance',
      customerName: 'Devadasan Nambiar (Bekal)',
      notes: 'Crown cleaning and mechanical harvest of 45 palms',
      recordedById: admin.id,
      verifiedById: admin.id,
    },
    {
      transactionNumber: 'TXN-20260922-0002',
      type: 'EXPENSE' as const,
      category: 'WORKER_WAGE' as const,
      amount: 3200,
      date: new Date('2026-09-22T17:30:00Z'),
      dateString: '2026-09-22',
      paymentMethod: 'CASH' as const,
      status: 'VERIFIED' as const,
      serviceType: 'Cococare - Palm Tree Harvesting & Maintenance',
      vendorName: 'Squad Daily Wage (2 Climbers)',
      workerId: worker?.id,
      notes: 'Daily wage distribution for Bekal plantation project',
      recordedById: actorId,
      verifiedById: admin.id,
    },
    {
      transactionNumber: 'TXN-20260924-0001',
      type: 'EXPENSE' as const,
      category: 'MATERIAL_PURCHASE' as const,
      amount: 6800,
      date: new Date('2026-09-24T09:45:00Z'),
      dateString: '2026-09-24',
      paymentMethod: 'UPI' as const,
      status: 'VERIFIED' as const,
      referenceNumber: 'GPay/773829104',
      serviceType: 'Plastering & Masonry Services',
      vendorName: 'Malabar Hardware & Cements',
      notes: '15 Bags UltraTech Cement + river sand load',
      recordedById: admin.id,
      verifiedById: admin.id,
    },
    {
      transactionNumber: 'TXN-20260925-0001',
      type: 'INCOME' as const,
      category: 'MILESTONE_PAYMENT' as const,
      amount: 22000,
      date: new Date('2026-09-25T16:00:00Z'),
      dateString: '2026-09-25',
      paymentMethod: 'UPI' as const,
      status: 'VERIFIED' as const,
      referenceNumber: 'PhonePe/44930219',
      serviceType: 'Tile, Marble & Granite Installation',
      customerName: 'Anoop Chandran (Cheruvathur)',
      notes: 'Second milestone payment for 1200 sq.ft vitrified floor laying',
      recordedById: admin.id,
      verifiedById: admin.id,
    },
    {
      transactionNumber: 'TXN-20260926-0001',
      type: 'INCOME' as const,
      category: 'SERVICE_PAYMENT' as const,
      amount: 12500,
      date: new Date('2026-09-26T10:15:00Z'),
      dateString: '2026-09-26',
      paymentMethod: 'UPI' as const,
      status: 'VERIFIED' as const,
      referenceNumber: 'GPay/9948201948',
      serviceType: 'Electrical & 3-Phase Wiring Systems',
      customerName: 'Harikrishnan M. (Kasaragod)',
      notes: 'Commercial 3-phase switchboard setup & inverter wiring completed',
      recordedById: admin.id,
      verifiedById: admin.id,
    },
    {
      transactionNumber: 'TXN-20260926-0002',
      type: 'EXPENSE' as const,
      category: 'WORKER_BATA' as const,
      amount: 650,
      date: new Date('2026-09-26T13:30:00Z'),
      dateString: '2026-09-26',
      paymentMethod: 'CASH' as const,
      status: 'VERIFIED' as const,
      serviceType: 'Electrical & 3-Phase Wiring Systems',
      vendorName: 'On-site Lunch & Tea Bata',
      notes: 'Site refreshments allowance for 3 technicians',
      recordedById: actorId,
      verifiedById: admin.id,
    },
    {
      transactionNumber: 'TXN-20260926-0003',
      type: 'EXPENSE' as const,
      category: 'FUEL_DIESEL' as const,
      amount: 3800,
      date: new Date('2026-09-26T15:00:00Z'),
      dateString: '2026-09-26',
      paymentMethod: 'CASH' as const,
      status: 'PENDING' as const,
      referenceNumber: 'REC-DIESEL-99',
      serviceType: 'JCB Heavy Machinery & Earth Excavation',
      vendorName: 'Indian Oil Bunk Kanhangad',
      notes: '42 Litres Diesel for earth excavation site at Hosdurg (Entered by Office Staff)',
      recordedById: actorId,
    },
  ];

  for (const item of sampleData) {
    const txn = await prisma.financialTransaction.create({
      data: item,
    });

    await prisma.auditLog.create({
      data: {
        userId: item.recordedById,
        userName: item.recordedById === admin.id ? 'Super Admin' : 'Office Staff',
        userRole: item.recordedById === admin.id ? 'SUPER_ADMIN' : 'OFFICE_STAFF',
        action: 'CREATE_FINANCE_TRANSACTION',
        entityType: 'FINANCE',
        entityId: txn.id,
        details: JSON.stringify({
          transactionNumber: txn.transactionNumber,
          type: txn.type,
          category: txn.category,
          amount: txn.amount,
          date: txn.dateString,
          paymentMethod: txn.paymentMethod,
          status: txn.status,
        }),
      },
    });
  }

  console.log(`Successfully seeded ${sampleData.length} finance transactions and audit logs.`);
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
