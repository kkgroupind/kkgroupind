import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ReminderFrequency } from '../../../database';

export class UpdateServiceReminderConfigDto {
  @IsOptional()
  @IsBoolean()
  hasReminder?: boolean;

  @IsOptional()
  @IsEnum(ReminderFrequency)
  reminderFrequency?: ReminderFrequency;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(730)
  reminderIntervalDays?: number;
}
