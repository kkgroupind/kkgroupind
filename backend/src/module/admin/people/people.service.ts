import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import { PeopleRepository } from './people.repository';
import { CreatePersonDto, ListPeopleDto, UpdatePersonDto } from './dto';
import {
  AUTH_MESSAGES,
  PEOPLE_MESSAGES,
  SECURITY_CONSTANTS,
  VALIDATION_MESSAGES,
  REGEX_PATTERNS,
} from '../../../common';
import { Role } from '../../../database';

@Injectable()
export class PeopleService {
  constructor(private readonly peopleRepo: PeopleRepository) {}

  async checkUsernameAvailability(username: string) {
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

    const existingUser = await this.peopleRepo.findByUsername(cleanUsername);
    if (!existingUser) {
      return {
        isAvailable: true,
        username: cleanUsername,
        suggestions: [],
      };
    }

    // Generate candidate suggestions using CSPRNG
    const candidateSet = new Set<string>();
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 5; i++) {
      candidateSet.add(`${cleanUsername}${crypto.randomInt(10, 99)}`);
      candidateSet.add(`${cleanUsername}_${crypto.randomInt(10, 99)}`);
    }
    for (let i = 0; i < 5; i++) {
      candidateSet.add(`${cleanUsername}${crypto.randomInt(100, 999)}`);
      candidateSet.add(`${cleanUsername}_${crypto.randomInt(100, 999)}`);
    }
    candidateSet.add(`${cleanUsername}${currentYear}`);
    candidateSet.add(`${cleanUsername}_${currentYear}`);
    candidateSet.add(`the_${cleanUsername}`);
    candidateSet.add(`real_${cleanUsername}`);

    const candidates = Array.from(candidateSet);
    const existingTaken = await this.peopleRepo.findExistingUsernames(candidates);
    const takenSet = new Set(existingTaken.map((u) => u.toLowerCase()));

    const availableSuggestions = candidates
      .filter((cand) => !takenSet.has(cand.toLowerCase()))
      .slice(0, 3);

    return {
      isAvailable: false,
      username: cleanUsername,
      suggestions: availableSuggestions,
    };
  }

  async checkEmailAvailability(email: string) {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail) {
      throw new BadRequestException(VALIDATION_MESSAGES.EMAIL_REQUIRED);
    }

    const existing = await this.peopleRepo.findByEmail(cleanEmail);
    return {
      isAvailable: !existing,
      email: cleanEmail,
    };
  }

  async createPerson(dto: CreatePersonDto) {
    if (
      dto.role !== Role.WORKER &&
      dto.role !== Role.OFFICE_STAFF &&
      dto.role !== Role.CUSTOMER
    ) {
      throw new BadRequestException(PEOPLE_MESSAGES.CANNOT_MANAGE_ROLE);
    }

    const finalName = dto.name?.trim();
    if (!finalName) {
      throw new BadRequestException(PEOPLE_MESSAGES.NAME_REQUIRED);
    }

    const finalMobile = dto.mobileNumber?.trim();
    if (!finalMobile) {
      throw new BadRequestException(PEOPLE_MESSAGES.PHONE_REQUIRED);
    }

    const finalUsername = dto.username?.trim().toLowerCase();
    if (!finalUsername) {
      throw new BadRequestException(VALIDATION_MESSAGES.USERNAME_REQUIRED);
    }

    const existingUsername = await this.peopleRepo.findByUsername(finalUsername);
    if (existingUsername) {
      throw new BadRequestException(
        AUTH_MESSAGES.USERNAME_ALREADY_EXISTS(finalUsername),
      );
    }

    let finalEmail: string | undefined;
    if (dto.role === Role.CUSTOMER) {
      if (!dto.email?.trim()) {
        throw new BadRequestException(PEOPLE_MESSAGES.CUSTOMER_EMAIL_REQUIRED);
      }
      finalEmail = dto.email.trim().toLowerCase();
      const existingEmail = await this.peopleRepo.findByEmail(finalEmail);
      if (existingEmail) {
        throw new BadRequestException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
    } else if (dto.email?.trim()) {
      finalEmail = dto.email.trim().toLowerCase();
      const existingEmail = await this.peopleRepo.findByEmail(finalEmail);
      if (existingEmail) {
        throw new BadRequestException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      SECURITY_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );

    const user = await this.peopleRepo.create({
      name: finalName,
      phone: finalMobile,
      username: finalUsername,
      email: finalEmail,
      password: hashedPassword,
      role: dto.role,
      isEmailVerified: true,
      isActive: true,
    });

    const { password: _, ...userWithoutPassword } = user;
    return {
      message: PEOPLE_MESSAGES.PERSON_CREATED_SUCCESS(dto.role),
      person: userWithoutPassword,
      staff: userWithoutPassword,
    };
  }

  async listPeople(dto: ListPeopleDto) {
    if (
      dto.role &&
      dto.role !== Role.WORKER &&
      dto.role !== Role.OFFICE_STAFF &&
      dto.role !== Role.CUSTOMER
    ) {
      throw new BadRequestException(PEOPLE_MESSAGES.CANNOT_MANAGE_ROLE);
    }
    const result = await this.peopleRepo.findManyPaginated(dto);

    return {
      ...result,
      data: result.data.map(({ password, ...user }) => user),
    };
  }

  async getPersonByUsername(username: string) {
    const user = await this.peopleRepo.findByUsername(username);
    if (!user) {
      throw new NotFoundException(PEOPLE_MESSAGES.PERSON_NOT_FOUND);
    }

    if (
      user.role !== Role.WORKER &&
      user.role !== Role.OFFICE_STAFF &&
      user.role !== Role.CUSTOMER
    ) {
      throw new NotFoundException(PEOPLE_MESSAGES.PERSON_NOT_FOUND);
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updatePerson(id: string, dto: UpdatePersonDto) {
    const user = await this.peopleRepo.findById(id);
    if (!user) {
      throw new NotFoundException(PEOPLE_MESSAGES.PERSON_NOT_FOUND);
    }

    if (
      user.role !== Role.WORKER &&
      user.role !== Role.OFFICE_STAFF &&
      user.role !== Role.CUSTOMER
    ) {
      throw new BadRequestException(PEOPLE_MESSAGES.CANNOT_MANAGE_ROLE);
    }

    const updateData: any = {};

    if (dto.name !== undefined) {
      const finalName = dto.name.trim();
      if (!finalName) {
        throw new BadRequestException(PEOPLE_MESSAGES.NAME_REQUIRED);
      }
      updateData.name = finalName;
    }

    if (dto.mobileNumber !== undefined) {
      const finalMobile = dto.mobileNumber.trim();
      if (!finalMobile) {
        throw new BadRequestException(PEOPLE_MESSAGES.PHONE_REQUIRED);
      }
      updateData.phone = finalMobile;
    }

    if (dto.username !== undefined) {
      const finalUsername = dto.username.trim().toLowerCase();
      if (!finalUsername) {
        throw new BadRequestException(VALIDATION_MESSAGES.USERNAME_REQUIRED);
      }
      if (finalUsername !== user.username) {
        if (!REGEX_PATTERNS.USERNAME.test(finalUsername)) {
          throw new BadRequestException(VALIDATION_MESSAGES.USERNAME_FORMAT);
        }
        const existingUsername = await this.peopleRepo.findByUsername(finalUsername);
        if (existingUsername && existingUsername.id !== id) {
          throw new BadRequestException(
            AUTH_MESSAGES.USERNAME_ALREADY_EXISTS(finalUsername),
          );
        }
        updateData.username = finalUsername;
      }
    }

    if (dto.email !== undefined) {
      const finalEmail = dto.email.trim().toLowerCase();
      if (finalEmail !== (user.email || '')) {
        if (finalEmail) {
          const existingEmail = await this.peopleRepo.findByEmail(finalEmail);
          if (existingEmail && existingEmail.id !== id) {
            throw new BadRequestException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
          }
          updateData.email = finalEmail;
        } else {
          if ((dto.role || user.role) === Role.CUSTOMER) {
            throw new BadRequestException(PEOPLE_MESSAGES.CUSTOMER_EMAIL_REQUIRED);
          }
          updateData.email = null;
        }
      }
    }

    if (dto.password !== undefined && dto.password.trim()) {
      updateData.password = await bcrypt.hash(
        dto.password,
        SECURITY_CONSTANTS.BCRYPT_SALT_ROUNDS,
      );
    }

    if (dto.role !== undefined) {
      if (
        dto.role !== Role.WORKER &&
        dto.role !== Role.OFFICE_STAFF &&
        dto.role !== Role.CUSTOMER
      ) {
        throw new BadRequestException(PEOPLE_MESSAGES.CANNOT_MANAGE_ROLE);
      }
      updateData.role = dto.role;
    }

    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }

    if (dto.workerStatus !== undefined) {
      updateData.workerStatus = dto.workerStatus;
    }

    if (dto.staffStatus !== undefined) {
      updateData.staffStatus = dto.staffStatus;
    }

    const updatedUser = await this.peopleRepo.update(id, updateData);
    const { password: _, ...userWithoutPassword } = updatedUser;
    return {
      message: PEOPLE_MESSAGES.PERSON_UPDATED_SUCCESS,
      person: userWithoutPassword,
    };
  }

  async deletePerson(id: string) {
    const user = await this.peopleRepo.findById(id);
    if (!user) {
      throw new NotFoundException(PEOPLE_MESSAGES.PERSON_NOT_FOUND);
    }

    if (
      user.role !== Role.WORKER &&
      user.role !== Role.OFFICE_STAFF &&
      user.role !== Role.CUSTOMER
    ) {
      throw new BadRequestException(PEOPLE_MESSAGES.CANNOT_MANAGE_ROLE);
    }

    await this.peopleRepo.delete(id);
    return { message: PEOPLE_MESSAGES.PERSON_DELETED_SUCCESS };
  }
}
