import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ReminderFrequency, ReminderStatus } from '../../../database';

export class UpdateReminderDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  serviceName?: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerAddress?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsEnum(ReminderFrequency)
  frequency?: ReminderFrequency;

  @IsOptional()
  @IsInt()
  @Min(1)
  customIntervalDays?: number;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  lastServicedDate?: string;

  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  feedCustomer?: boolean;
}
