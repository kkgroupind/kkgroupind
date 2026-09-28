import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AssignWorkerDto {
  @IsString()
  @IsNotEmpty({ message: 'Worker ID is required' })
  workerId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  squadWorkerIds?: string[];

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
  wageType?: string;

  @IsOptional()
  @IsString()
  unitLabel?: string;

  @IsOptional()
  @IsNumber()
  unitRate?: number;

  @IsOptional()
  @IsNumber()
  workerUnitWage?: number;

  @IsOptional()
  @IsNumber()
  estimatedUnits?: number;

  @IsOptional()
  @IsNumber()
  minUnits?: number;

  @IsOptional()
  specificationDetails?: any;

  @IsOptional()
  @IsString()
  deadline?: string;
}
