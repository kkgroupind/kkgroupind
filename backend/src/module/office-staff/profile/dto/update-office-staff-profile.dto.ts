import {
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
import { StaffStatus } from '../../../../database';

export class UpdateOfficeStaffProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(SECURITY_CONSTANTS.USERNAME_MIN_LENGTH, {
    message: VALIDATION_MESSAGES.USERNAME_MIN_LENGTH,
  })
  username?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  email?: string;

  @IsOptional()
  @IsEnum(StaffStatus)
  staffStatus?: StaffStatus;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(SECURITY_CONSTANTS.PASSWORD_MIN_LENGTH, {
    message: VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
  })
  @Matches(REGEX_PATTERNS.PASSWORD, {
    message: VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
  })
  newPassword?: string;
}
