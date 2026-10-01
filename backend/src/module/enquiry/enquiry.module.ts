import { Module } from '@nestjs/common';
import { EnquiryController } from './enquiry.controller';
import { EnquiryService } from './enquiry.service';
import { EnquiryRepository } from './enquiry.repository';
import { PrismaModule } from '../../database';
import { FinanceModule } from '../finance/finance.module';
import { ReminderModule } from '../reminder/reminder.module';

@Module({
  imports: [PrismaModule, FinanceModule, ReminderModule],
  controllers: [EnquiryController],
  providers: [EnquiryService, EnquiryRepository],
  exports: [EnquiryService, EnquiryRepository],
})
export class EnquiryModule {}
