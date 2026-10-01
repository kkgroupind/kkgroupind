import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ReminderFrequency, ReminderStatus } from '../../../database';
import { REMINDER_MESSAGES } from '../../../common';

export class CreateReminderDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @IsNotEmpty({ message: REMINDER_MESSAGES.SERVICE_NAME_REQUIRED })
  serviceName: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsString()
  @IsNotEmpty({ message: REMINDER_MESSAGES.CUSTOMER_NAME_REQUIRED })
  customerName: string;

  @IsString()
  @IsNotEmpty({ message: REMINDER_MESSAGES.CUSTOMER_PHONE_REQUIRED })
  customerPhone: string;

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

  @IsString()
  @IsNotEmpty({ message: REMINDER_MESSAGES.DUE_DATE_REQUIRED })
  dueDate: string;

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
