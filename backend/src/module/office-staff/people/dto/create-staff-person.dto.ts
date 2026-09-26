import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import {
  PEOPLE_MESSAGES,
  REGEX_PATTERNS,
  SECURITY_CONSTANTS,
  VALIDATION_MESSAGES,
} from '../../../../common';
import { Role } from '../../../../database';

export class CreateStaffPersonDto {
  @IsString()
  @IsNotEmpty({ message: PEOPLE_MESSAGES.NAME_REQUIRED })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: PEOPLE_MESSAGES.PHONE_REQUIRED })
  mobileNumber: string;

  @IsString()
  @IsNotEmpty({ message: VALIDATION_MESSAGES.USERNAME_REQUIRED })
  @MinLength(SECURITY_CONSTANTS.USERNAME_MIN_LENGTH, {
    message: VALIDATION_MESSAGES.USERNAME_MIN_LENGTH,
  })
  username: string;

  @IsString()
  @IsNotEmpty({ message: VALIDATION_MESSAGES.PASSWORD_REQUIRED })
  @MinLength(SECURITY_CONSTANTS.PASSWORD_MIN_LENGTH, {
    message: VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
  })
  @Matches(REGEX_PATTERNS.PASSWORD, {
    message: VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
  })
  password: string;

  @IsEnum(Role, { message: 'Role must be either WORKER or CUSTOMER' })
  @IsNotEmpty()
  role: Role;

  @IsOptional()
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  email?: string;
}
