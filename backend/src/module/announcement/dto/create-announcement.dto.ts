import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { TargetAudience } from '../../../database';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(TargetAudience)
  @IsOptional()
  target?: TargetAudience;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
