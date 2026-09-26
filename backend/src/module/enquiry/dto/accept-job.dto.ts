import { IsOptional, IsString } from 'class-validator';

export class AcceptJobDto {
  @IsOptional()
  @IsString()
  workerAcceptance?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
