import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AssignWorkerDto {
  @IsString()
  @IsNotEmpty({ message: 'Worker ID is required' })
  workerId: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  mapUrl?: string;

  @IsOptional()
  @IsString()
  locationRemarks?: string;

  @IsOptional()
  @IsBoolean()
  isHourlyCalculated?: boolean;

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  deadline?: string;
}
