import { Module } from '@nestjs/common';
import { EnquiryController } from './enquiry.controller';
import { EnquiryService } from './enquiry.service';
import { EnquiryRepository } from './enquiry.repository';
import { PrismaModule } from '../../database';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [PrismaModule, FinanceModule],
  controllers: [EnquiryController],
  providers: [EnquiryService, EnquiryRepository],
  exports: [EnquiryService, EnquiryRepository],
})
export class EnquiryModule {}
