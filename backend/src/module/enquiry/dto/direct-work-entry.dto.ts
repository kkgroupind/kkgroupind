import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMethod, ServiceStatus } from '../../../database';

export class DirectWorkEntryDto {
  @IsString()
  @IsNotEmpty({ message: 'Service name is required' })
  serviceName: string;

  @IsString()
  @IsNotEmpty({ message: 'Customer name is required' })
  customerName: string;

  @IsString()
  @IsNotEmpty({ message: 'Customer phone number is required' })
  customerPhone: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  mapUrl?: string;

  @IsOptional()
  @IsString()
  locationRemarks?: string;

  @IsOptional()
  @IsString()
  preferredDate?: string;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(ServiceStatus)
  targetStatus?: ServiceStatus;

  @IsOptional()
  @IsString()
  workerId?: string;

  @IsOptional()
  @IsString()
  wageType?: string;

  @IsOptional()
  @IsString()
  unitLabel?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  workerUnitWage?: number;

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
  @IsString()
  inTime?: string;

  @IsOptional()
  @IsString()
  outTime?: string;

  @IsOptional()
  specificationDetails?: any;

  @IsOptional()
  @IsBoolean()
  recordPayment?: boolean;

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
  @IsString()
  paymentNotes?: string;
}

