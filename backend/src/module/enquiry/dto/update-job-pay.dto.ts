import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateJobPayDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCalculatedWage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  workerUnitWage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCalculatedCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  completedUnits?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
