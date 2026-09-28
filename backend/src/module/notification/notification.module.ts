import { Module, Global } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';

@Global()
@Module({
  controllers: [NotificationController],
  providers: [NotificationRepository, NotificationService],
  exports: [NotificationRepository, NotificationService],
})
export class NotificationModule {}
