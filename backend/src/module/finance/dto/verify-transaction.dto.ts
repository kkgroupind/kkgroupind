import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FinancialStatus } from '../../../database';

export class VerifyTransactionDto {
  @IsEnum(FinancialStatus)
  @IsNotEmpty()
  status: FinancialStatus; // VERIFIED or REJECTED

  @IsString()
  @IsOptional()
  notes?: string;
}
