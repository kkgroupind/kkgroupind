import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ProfileRepository } from './profile.repository';
import { UpdateOfficeStaffProfileDto } from './dto';
import {
  AUTH_MESSAGES,
  CloudinaryService,
  PROFILE_MESSAGES,
  REGEX_PATTERNS,
  SECURITY_CONSTANTS,
  VALIDATION_MESSAGES,
} from '../../../common';
import { Role } from '../../../database';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getProfile(staffId: string) {
    const user = await this.profileRepo.findById(staffId);
    if (!user) {
      throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    if (user.role !== Role.OFFICE_STAFF && user.role !== Role.SUPER_ADMIN) {
      throw new UnauthorizedException(AUTH_MESSAGES.NO_ACCESS_PERMISSIONS);
    }

    const { password: _, ...sanitizedUser } = user;
    return {
      message: PROFILE_MESSAGES.PROFILE_FETCHED_SUCCESS,
      user: sanitizedUser,
    };
  }

  async updateProfile(staffId: string, dto: UpdateOfficeStaffProfileDto) {
    const user = await this.profileRepo.findById(staffId);
    if (!user) {
      throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    if (user.role !== Role.OFFICE_STAFF && user.role !== Role.SUPER_ADMIN) {
      throw new UnauthorizedException(AUTH_MESSAGES.NO_ACCESS_PERMISSIONS);
    }

    const updateData: Record<string, any> = {};

    if (dto.name !== undefined) {
      const finalName = dto.name.trim();
      if (!finalName) {
        throw new BadRequestException('Name cannot be empty');
      }
      updateData.name = finalName;
    }

    if (dto.mobileNumber !== undefined) {
      const finalMobile = dto.mobileNumber.trim();
      updateData.phone = finalMobile || null;
    }

    if (dto.staffStatus !== undefined) {
      updateData.staffStatus = dto.staffStatus;
    }

    if (dto.avatar !== undefined) {
      updateData.avatar = dto.avatar || null;
    }

    if (dto.username !== undefined) {
      const finalUsername = dto.username.trim().toLowerCase();
      if (!finalUsername) {
        throw new BadRequestException(VALIDATION_MESSAGES.USERNAME_REQUIRED);
      }
      if (finalUsername !== (user.username || '').toLowerCase()) {
        if (!REGEX_PATTERNS.USERNAME.test(finalUsername)) {
          throw new BadRequestException(VALIDATION_MESSAGES.USERNAME_FORMAT);
        }
        const existing = await this.profileRepo.findByUsername(finalUsername);
        if (existing && existing.id !== staffId) {
          throw new BadRequestException(
            AUTH_MESSAGES.USERNAME_ALREADY_EXISTS(finalUsername),
          );
        }
        updateData.username = finalUsername;
      }
    }

    if (dto.email !== undefined) {
      const finalEmail = dto.email.trim().toLowerCase();
      if (!finalEmail) {
        throw new BadRequestException(VALIDATION_MESSAGES.EMAIL_REQUIRED);
      }
      if (finalEmail !== (user.email || '').toLowerCase()) {
        const existing = await this.profileRepo.findByEmail(finalEmail);
        if (existing && existing.id !== staffId) {
          throw new BadRequestException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
        }
        updateData.email = finalEmail;
      }
    }

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          'Current password is required to set a new password',
        );
      }

      const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException(
          PROFILE_MESSAGES.CURRENT_PASSWORD_INCORRECT,
        );
      }

      updateData.password = await bcrypt.hash(
        dto.newPassword,
        SECURITY_CONSTANTS.BCRYPT_SALT_ROUNDS,
      );
    }

    const updatedUser = await this.profileRepo.update(staffId, updateData);
    const { password: _, ...sanitizedUser } = updatedUser;

    return {
      message: PROFILE_MESSAGES.PROFILE_UPDATED_SUCCESS,
      user: sanitizedUser,
    };
  }

  async checkUsernameAvailability(username: string, currentStaffId?: string) {
    const cleanUsername = username?.trim().toLowerCase();
    if (!cleanUsername) {
      throw new BadRequestException(VALIDATION_MESSAGES.USERNAME_REQUIRED);
    }

    if (cleanUsername.length < SECURITY_CONSTANTS.USERNAME_MIN_LENGTH) {
      throw new BadRequestException(VALIDATION_MESSAGES.USERNAME_MIN_LENGTH);
    }

    if (!REGEX_PATTERNS.USERNAME.test(cleanUsername)) {
      throw new BadRequestException(VALIDATION_MESSAGES.USERNAME_FORMAT);
    }

    const existingUser = await this.profileRepo.findByUsername(cleanUsername);
    if (!existingUser || (currentStaffId && existingUser.id === currentStaffId)) {
      return {
        isAvailable: true,
        username: cleanUsername,
      };
    }

    return {
      isAvailable: false,
      username: cleanUsername,
    };
  }

  getCloudinaryConfig() {
    return this.cloudinaryService.getPublicConfig();
  }

  async uploadAvatar(staffId: string, imageStr: string) {
    const user = await this.profileRepo.findById(staffId);
    if (!user) {
      throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
    }
    if (!imageStr) {
      throw new BadRequestException('Image data is required');
    }

    const uploadRes = await this.cloudinaryService.uploadImage(
      imageStr,
      'kk-group/staff-avatars',
    );

    const updatedUser = await this.profileRepo.update(staffId, {
      avatar: uploadRes.secure_url,
    });
    const { password: _, ...sanitizedUser } = updatedUser;

    return {
      message: 'Avatar uploaded and profile updated successfully',
      avatar: uploadRes.secure_url,
      user: sanitizedUser,
    };
  }
}
