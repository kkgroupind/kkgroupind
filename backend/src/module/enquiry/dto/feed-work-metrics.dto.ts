import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethod } from '../../../database';

export class FeedWorkMetricsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  completedUnits?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  workDurationMinutes?: number;

  @IsOptional()
  @IsString()
  workStartedAt?: string;

  @IsOptional()
  @IsString()
  workEndedAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalBreakMinutes?: number;

  @IsOptional()
  specificationDetails?: any;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paymentAmount?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsBoolean()
  confirmPayment?: boolean;
}
