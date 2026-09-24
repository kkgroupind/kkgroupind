import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum AvailabilityStatusInput {
  AVAILABLE = 'AVAILABLE',
  OFF_DUTY = 'OFF_DUTY',
}

export class UpdateAttendanceDto {
  @IsEnum(AvailabilityStatusInput, {
    message: 'Status must be either AVAILABLE or OFF_DUTY',
  })
  status: AvailabilityStatusInput;

  @IsOptional()
  @IsString()
  notes?: string;
}
