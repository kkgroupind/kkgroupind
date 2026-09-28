import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
  completedUnits?: number;

  @IsOptional()
  specificationDetails?: any;

  @IsOptional()
  @IsString()
  completionNotes?: string;
}

export class PauseWorkTimerDto {
  @IsString()
  @IsNotEmpty({ message: 'Break reason is required' })
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  specificationDetails?: any;
}

export class ResumeWorkTimerDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  specificationDetails?: any;
}

export class SaveWorkDraftDto {
  @IsOptional()
  @IsNumber()
  completedUnits?: number;

  @IsOptional()
  specificationDetails?: any;

  @IsOptional()
  @IsString()
  notes?: string;
}
