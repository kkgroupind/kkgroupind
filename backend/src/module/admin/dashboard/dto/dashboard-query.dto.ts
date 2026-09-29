import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, IsEnum } from 'class-validator';

export enum PerformanceInterval {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class DashboardPerformanceDto {
  @IsOptional()
  @IsEnum(PerformanceInterval)
  interval?: PerformanceInterval = PerformanceInterval.WEEKLY;
}

export class DashboardTrendsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  months?: number = 6;
}

export class DashboardRecentActivityDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  role?: string; // 'ALL' | 'WORKER' | 'CUSTOMER' | 'OFFICE_STAFF'
}
