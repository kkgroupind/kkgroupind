import { Module } from '@nestjs/common';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';
import { ReminderRepository } from './reminder.repository';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [ReminderController],
  providers: [ReminderService, ReminderRepository],
  exports: [ReminderService, ReminderRepository],
})
export class ReminderModule {}
