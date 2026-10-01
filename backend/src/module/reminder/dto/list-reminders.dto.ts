import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ReminderFrequency, ReminderStatus } from '../../../database';

export class ListRemindersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;

  @IsOptional()
  @IsEnum(ReminderFrequency)
  frequency?: ReminderFrequency;

  @IsOptional()
  @IsString()
  serviceName?: string;

  @IsOptional()
  @IsString()
  dueFilter?: 'ALL' | 'OVERDUE' | 'DUE_TODAY' | 'THIS_WEEK' | 'THIS_MONTH';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}
