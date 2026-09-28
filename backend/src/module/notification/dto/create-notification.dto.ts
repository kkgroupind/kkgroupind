import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { NotificationType } from '../../../database';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  metadata?: any;
}
