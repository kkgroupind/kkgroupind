import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import {
  REGEX_PATTERNS,
  SECURITY_CONSTANTS,
  VALIDATION_MESSAGES,
} from '../../../../common';
import { Role, StaffStatus, WorkerStatus } from '../../../../database';

export class UpdatePersonDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(SECURITY_CONSTANTS.USERNAME_MIN_LENGTH, {
    message: VALIDATION_MESSAGES.USERNAME_MIN_LENGTH,
  })
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(SECURITY_CONSTANTS.PASSWORD_MIN_LENGTH, {
    message: VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
  })
  @Matches(REGEX_PATTERNS.PASSWORD, {
    message: VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
  })
  password?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be a valid enum value' })
  role?: Role;

  @IsOptional()
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(WorkerStatus)
  workerStatus?: WorkerStatus;

  @IsOptional()
  @IsEnum(StaffStatus)
  staffStatus?: StaffStatus;

  @IsOptional()
  @IsString()
  avatar?: string;
}
