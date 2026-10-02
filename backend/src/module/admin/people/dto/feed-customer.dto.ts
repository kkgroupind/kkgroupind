import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ServiceStatus } from '../../../../database';

export class FeedCustomerDto {
  // 1. Customer Personal Information
  @IsString()
  @IsNotEmpty({ message: 'Customer full name is required' })
  @MinLength(2, { message: 'Customer name must be at least 2 characters' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Customer phone number is required' })
  mobileNumber: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  // 2. Service Toggle & Job Details
  @IsOptional()
  @IsBoolean()
  addService?: boolean;

  @IsOptional()
  @IsString()
  serviceName?: string;

  @IsOptional()
  @IsString()
  serviceDate?: string; // YYYY-MM-DD or ISO string

  @IsOptional()
  @IsEnum(ServiceStatus, { message: 'Invalid service status' })
  serviceStatus?: ServiceStatus;

  @IsOptional()
  @IsNumber()
  serviceCost?: number;

  @IsOptional()
  @IsString()
  serviceNotes?: string;

  // 3. Worker Toggle & Assignment
  @IsOptional()
  @IsBoolean()
  addWorker?: boolean;

  @IsOptional()
  @IsString()
  workerId?: string;
}
