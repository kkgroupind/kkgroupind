import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ServiceStatus } from '../../../database';

export class UpdateJobPayDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCalculatedWage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  workerUnitWage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCalculatedCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  completedUnits?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  workDurationMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalBreakMinutes?: number;

  @IsOptional()
  @IsString()
  unitLabel?: string;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsOptional()
  @IsString()
  workStartedAt?: string;

  @IsOptional()
  @IsString()
  workEndedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  paymentMode?: string;

  @IsOptional()
  @IsString()
  paymentRef?: string;
}
