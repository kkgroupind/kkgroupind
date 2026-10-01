import { PrismaService } from '../src/database/prisma.service';
import { ReminderFrequency } from '../src/database';
import 'dotenv/config';

const prisma = new PrismaService();

async function main() {
  await prisma.onModuleInit();
  console.log('--- Initializing Standard Service Recurring Reminder Configurations ---');

  // 1. Coconut Palm Tree Plucking & Crown Cleaning -> Every 3 Months
  const coconutService = await prisma.service.findFirst({
    where: {
      OR: [
        { name: { contains: 'Coconut', mode: 'insensitive' } },
        { slug: { contains: 'coconut', mode: 'insensitive' } },
      ],
    },
  });

  if (coconutService) {
    await prisma.service.update({
      where: { id: coconutService.id },
      data: {
        hasReminder: true,
        reminderFrequency: ReminderFrequency.EVERY_3_MONTHS,
        reminderIntervalDays: 90,
      },
    });
    console.log(`✓ Enabled auto-reminder for Coconut service (${coconutService.name}): EVERY_3_MONTHS`);
  }

  // 2. Traditional Well Cleaning & Desiltation -> Every 6 Months
  const wellService = await prisma.service.findFirst({
    where: {
      OR: [
        { name: { contains: 'Well', mode: 'insensitive' } },
        { slug: { contains: 'well', mode: 'insensitive' } },
      ],
    },
  });

  if (wellService) {
    await prisma.service.update({
      where: { id: wellService.id },
      data: {
        hasReminder: true,
        reminderFrequency: ReminderFrequency.EVERY_6_MONTHS,
        reminderIntervalDays: 180,
      },
    });
    console.log(`✓ Enabled auto-reminder for Well Cleaning service (${wellService.name}): EVERY_6_MONTHS`);
  }

  // 3. Solar Panel Cleaning & Maintenance -> Every 3 Months
  const solarService = await prisma.service.findFirst({
    where: {
      OR: [
        { name: { contains: 'Solar', mode: 'insensitive' } },
        { slug: { contains: 'solar', mode: 'insensitive' } },
      ],
    },
  });

  if (solarService) {
    await prisma.service.update({
      where: { id: solarService.id },
      data: {
        hasReminder: true,
        reminderFrequency: ReminderFrequency.EVERY_3_MONTHS,
        reminderIntervalDays: 90,
      },
    });
    console.log(`✓ Enabled auto-reminder for Solar service (${solarService.name}): EVERY_3_MONTHS`);
  }

  console.log('--- Service Reminder Seed Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.onModuleDestroy();
  });
