import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class StartWorkTimerDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class StopWorkTimerDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  completionNotes?: string;
}
