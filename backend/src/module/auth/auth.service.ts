import * as crypto from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  AUTH_MESSAGES,
  MAIL_CONSTANTS,
  SECURITY_CONSTANTS,
  resolveUniqueUsername,
} from '../../common';
import { OtpType, Role } from '../../database';
import { MailService } from '../mail/mail.service';
import { AuthRepository } from './auth.repository';
import {
  AdminLoginDto,
  CustomerLoginDto,
  RegisterCustomerDto,
  ResendOtpDto,
  StaffLoginDto,
  VerifyOtpDto,
} from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = SECURITY_CONSTANTS.BCRYPT_SALT_ROUNDS;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  private generate6DigitOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  private hashOtp(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  private generateToken(user: {
    id: string;
    email?: string | null;
    username?: string | null;
    role: Role;
  }): string {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: {
    id: string;
    email?: string | null;
    username?: string | null;
    name?: string | null;
    phone?: string | null;
    role: Role;
    workerStatus?: any;
    staffStatus?: any;
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      phone: user.phone,
      role: user.role,
      workerStatus: user.workerStatus,
      staffStatus: user.staffStatus,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // ==========================================
  // CUSTOMER AUTHENTICATION FLOW
  // ==========================================

  async registerCustomer(dto: RegisterCustomerDto) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.authRepository.findUserByEmail(email);

    const hashedPassword = await bcrypt.hash(dto.password, this.saltRounds);

    let user;
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new ConflictException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
      // If the unverified user has no username, backfill it now
      if (!existingUser.username) {
        const candidateUsername = await resolveUniqueUsername(
          email,
          async (candidate) => {
            const found = await this.authRepository.findUserByUsername(candidate);
            return !!found && found.id !== existingUser.id;
          },
        );
        await this.authRepository.updateUser(existingUser.id, {
          username: candidateUsername,
        });
        existingUser.username = candidateUsername;
      }
      user = existingUser;
    } else {
      const candidateUsername = await resolveUniqueUsername(
        email,
        async (candidate) => {
          const found = await this.authRepository.findUserByUsername(candidate);
          return !!found;
        },
      );

      user = await this.authRepository.createUser({
        email,
        username: candidateUsername,
        password: hashedPassword,
        role: Role.CUSTOMER,
        isEmailVerified: false,
        isActive: true,
      });
    }

    // Invalidate any existing active OTPs for this email
    await this.authRepository.invalidateActiveOtps(email);

    // Create 6-digit cryptographically secure OTP valid for configured expiry
    const code = this.generate6DigitOtp();
    const hashedCode = this.hashOtp(code);
    const expiresAt = new Date(Date.now() + SECURITY_CONSTANTS.OTP_EXPIRY_MS);

    await this.authRepository.createOtp({
      email,
      code: hashedCode,
      type: OtpType.EMAIL_VERIFICATION,
      expiresAt,
      attempts: 0,
      userId: user.id,
    });

    await this.mailService.sendOtpEmail(
      email,
      code,
      MAIL_CONSTANTS.PURPOSE_VERIFICATION,
    );

    return {
      message: AUTH_MESSAGES.REGISTRATION_INITIATED,
      email,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const email = dto.email.trim().toLowerCase();
    const code = dto.code.trim();

    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException(AUTH_MESSAGES.EMAIL_NOT_FOUND);
    }

    const otpRecord = await this.authRepository.findActiveOtpByEmail(email);

    if (!otpRecord) {
      throw new BadRequestException(AUTH_MESSAGES.INVALID_OR_EXPIRED_OTP);
    }

    // Check brute-force attempts
    const incomingHash = this.hashOtp(code);
    if (otpRecord.code !== incomingHash) {
      const newAttempts = otpRecord.attempts + 1;
      if (newAttempts >= SECURITY_CONSTANTS.OTP_MAX_ATTEMPTS) {
        await this.authRepository.updateOtp(otpRecord.id, {
          isUsed: true,
          attempts: newAttempts,
        });
        throw new BadRequestException(AUTH_MESSAGES.OTP_MAX_ATTEMPTS_EXCEEDED);
      }

      await this.authRepository.updateOtp(otpRecord.id, {
        attempts: newAttempts,
      });

      const remainingAttempts = SECURITY_CONSTANTS.OTP_MAX_ATTEMPTS - newAttempts;
      throw new BadRequestException(
        AUTH_MESSAGES.OTP_REMAINING_ATTEMPTS(remainingAttempts),
      );
    }

    // Mark OTP used
    await this.authRepository.updateOtp(otpRecord.id, { isUsed: true });

    // Mark user as verified
    const updatedUser = await this.authRepository.updateUser(user.id, {
      isEmailVerified: true,
    });

    const token = this.generateToken(updatedUser);

    return {
      message: AUTH_MESSAGES.EMAIL_VERIFIED_SUCCESS,
      token,
      user: this.sanitizeUser(updatedUser),
    };
  }

  async resendOtp(dto: ResendOtpDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException(AUTH_MESSAGES.EMAIL_NOT_FOUND);
    }

    if (user.isEmailVerified) {
      throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_ALREADY_VERIFIED);
    }

    // Check cooldown on backend
    const latestOtp = await this.authRepository.findLatestOtpByEmail(email);

    if (latestOtp) {
      const elapsedMs = Date.now() - latestOtp.createdAt.getTime();
      const cooldownMs = SECURITY_CONSTANTS.OTP_COOLDOWN_MS;
      if (elapsedMs < cooldownMs) {
        const waitSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
        throw new BadRequestException(AUTH_MESSAGES.OTP_COOLDOWN(waitSeconds));
      }
    }

    // Invalidate previous OTPs
    await this.authRepository.invalidateActiveOtps(email);

    const code = this.generate6DigitOtp();
    const hashedCode = this.hashOtp(code);
    const expiresAt = new Date(Date.now() + SECURITY_CONSTANTS.OTP_EXPIRY_MS);

    await this.authRepository.createOtp({
      email,
      code: hashedCode,
      type: OtpType.EMAIL_VERIFICATION,
      expiresAt,
      attempts: 0,
      userId: user.id,
    });

    await this.mailService.sendOtpEmail(
      email,
      code,
      MAIL_CONSTANTS.PURPOSE_VERIFICATION,
    );

    return {
      message: AUTH_MESSAGES.OTP_DISPATCHED_SUCCESS,
      email,
    };
  }

  async customerLogin(dto: CustomerLoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.authRepository.findUserByEmail(email);

    if (!user || user.role !== Role.CUSTOMER) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AUTH_MESSAGES.ACCOUNT_DEACTIVATED);
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.isEmailVerified) {
      // Check cooldown before dispatching a new OTP
      const latestOtp = await this.authRepository.findActiveOtpByEmail(email);

      if (latestOtp) {
        const elapsedMs = Date.now() - latestOtp.createdAt.getTime();
        if (elapsedMs < SECURITY_CONSTANTS.OTP_COOLDOWN_MS) {
          throw new ForbiddenException({
            message: AUTH_MESSAGES.EMAIL_NOT_VERIFIED_RECENT,
            code: 'EMAIL_NOT_VERIFIED',
            email,
          });
        }
      }

      await this.authRepository.invalidateActiveOtps(email);

      const code = this.generate6DigitOtp();
      const hashedCode = this.hashOtp(code);
      const expiresAt = new Date(Date.now() + SECURITY_CONSTANTS.OTP_EXPIRY_MS);

      await this.authRepository.createOtp({
        email,
        code: hashedCode,
        type: OtpType.EMAIL_VERIFICATION,
        expiresAt,
        attempts: 0,
        userId: user.id,
      });

      await this.mailService.sendOtpEmail(
        email,
        code,
        MAIL_CONSTANTS.PURPOSE_VERIFICATION,
      );

      throw new ForbiddenException({
        message: AUTH_MESSAGES.EMAIL_NOT_VERIFIED_DISPATCHED,
        code: 'EMAIL_NOT_VERIFIED',
        email,
      });
    }

    const token = this.generateToken(user);
    return {
      message: AUTH_MESSAGES.CUSTOMER_SIGNIN_SUCCESS,
      token,
      user: this.sanitizeUser(user),
    };
  }

  // ==========================================
  // WORKER & OFFICE STAFF LOGIN FLOW
  // ==========================================

  async staffLogin(dto: StaffLoginDto) {
    const username = dto.username.trim();

    const user = await this.authRepository.findUserByUsername(username);

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_STAFF_CREDENTIALS);
    }

    if (user.role !== Role.WORKER && user.role !== Role.OFFICE_STAFF) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_STAFF_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AUTH_MESSAGES.STAFF_ACCOUNT_DEACTIVATED);
    }

    if (dto.portalRole && user.role !== dto.portalRole) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_STAFF_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_STAFF_CREDENTIALS);
    }

    const token = this.generateToken(user);
    return {
      message: AUTH_MESSAGES.STAFF_SIGNIN_SUCCESS(user.role),
      token,
      user: this.sanitizeUser(user),
    };
  }

  // ==========================================
  // SUPER ADMIN LOGIN FLOW
  // ==========================================

  async adminLogin(dto: AdminLoginDto) {
    const identifier = dto.identifier.trim();

    // Support logging in by either email or username
    const user = await this.authRepository.findSuperAdminByIdentifier(identifier);

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_ADMIN_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AUTH_MESSAGES.ADMIN_ACCOUNT_DEACTIVATED);
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_ADMIN_CREDENTIALS);
    }

    const token = this.generateToken(user);
    return {
      message: AUTH_MESSAGES.ADMIN_SIGNIN_SUCCESS,
      token,
      user: this.sanitizeUser(user),
    };
  }



  async getMe(userId: string) {
    const user = await this.authRepository.findActiveUserForJwt(userId);

    if (!user) {
      throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }
}
