import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { FinanceRepository } from './finance.repository';

@Module({
  controllers: [FinanceController],
  providers: [FinanceRepository, FinanceService],
  exports: [FinanceRepository, FinanceService],
})
export class FinanceModule {}
