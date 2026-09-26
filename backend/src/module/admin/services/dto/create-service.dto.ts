import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { SERVICE_MESSAGES } from '../../../../common';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty({ message: SERVICE_MESSAGES.NAME_REQUIRED })
  @MinLength(2, { message: 'Service name must be at least 2 characters long' })
  name: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsString()
  @IsNotEmpty({ message: SERVICE_MESSAGES.DESCRIPTION_REQUIRED })
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  priceRange?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
