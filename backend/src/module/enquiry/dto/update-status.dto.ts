import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ServiceStatus } from '../../../database';

export class UpdateEnquiryStatusDto {
  @IsEnum(ServiceStatus, { message: 'Invalid service status' })
  @IsNotEmpty({ message: 'Status is required' })
  status: ServiceStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  completedUnits?: number;

  @IsOptional()
  specificationDetails?: any;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  workStartedAt?: string;

  @IsOptional()
  @IsString()
  workEndedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  workDurationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalBreakMinutes?: number;
}
