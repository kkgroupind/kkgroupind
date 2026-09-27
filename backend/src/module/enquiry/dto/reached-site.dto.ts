import { IsOptional, IsString } from 'class-validator';

export class ReachedSiteDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
