import { Module } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [AnnouncementController],
  providers: [AnnouncementService],
  exports: [AnnouncementService],
})
export class AnnouncementModule {}
