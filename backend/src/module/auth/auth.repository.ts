import { Injectable } from '@nestjs/common';
import { Otp, OtpType, Prisma, PrismaService, Role, User } from '../../database';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // USER DATABASE OPERATIONS
  // ==========================================

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findActiveUserForJwt(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        workerStatus: true,
        staffStatus: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findSuperAdminByIdentifier(identifier: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        role: Role.SUPER_ADMIN,
        OR: [
          { email: identifier.toLowerCase() },
          { username: identifier },
        ],
      },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }



  // ==========================================
  // OTP DATABASE OPERATIONS
  // ==========================================

  async createOtp(data: {
    email: string;
    code: string;
    type?: OtpType;
    expiresAt: Date;
    attempts?: number;
    userId?: string;
  }): Promise<Otp> {
    return this.prisma.otp.create({
      data: {
        email: data.email,
        code: data.code,
        type: data.type || OtpType.EMAIL_VERIFICATION,
        expiresAt: data.expiresAt,
        attempts: data.attempts ?? 0,
        userId: data.userId,
      },
    });
  }

  async findActiveOtpByEmail(email: string): Promise<Otp | null> {
    return this.prisma.otp.findFirst({
      where: {
        email,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findLatestOtpByEmail(email: string): Promise<Otp | null> {
    return this.prisma.otp.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOtp(id: string, data: Prisma.OtpUpdateInput): Promise<Otp> {
    return this.prisma.otp.update({
      where: { id },
      data,
    });
  }

  async invalidateActiveOtps(email: string): Promise<Prisma.BatchPayload> {
    return this.prisma.otp.updateMany({
      where: { email, isUsed: false },
      data: { isUsed: true },
    });
  }
}
