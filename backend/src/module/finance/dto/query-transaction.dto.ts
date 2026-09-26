import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import {
  FinancialStatus,
  PaymentMethod,
  TransactionCategory,
  TransactionType,
} from '../../../database';

export class QueryTransactionDto {
  @IsOptional()
  @IsString()
  date?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  month?: string; // YYYY-MM

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsEnum(TransactionCategory)
  category?: TransactionCategory;

  @IsOptional()
  @IsEnum(FinancialStatus)
  status?: FinancialStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsString()
  enquiryId?: string;

  @IsOptional()
  @IsString()
  workerId?: string;

  @IsOptional()
  @IsString()
  recordedById?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 25;
}
