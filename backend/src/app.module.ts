import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import mailConfig from './config/mail.config';
import cloudinaryConfig from './config/cloudinary.config';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './database/prisma.module';
import { MailModule } from './module/mail/mail.module';
import { AuthModule } from './module/auth/auth.module';
import { AdminModule } from './module/admin/admin.module';
import { EnquiryModule } from './module/enquiry/enquiry.module';
import { AttendanceModule } from './module/attendance/attendance.module';
import { OfficeStaffModule } from './module/office-staff/office-staff.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  CloudinaryModule,
  HttpExceptionFilter,
  JwtAuthGuard,
  RATE_LIMITS,
  RolesGuard,
  TransformInterceptor,
} from './common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, mailConfig, cloudinaryConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        libraryOptions: {
          abortEarly: true,
        },
      },
    }),

    ThrottlerModule.forRoot([RATE_LIMITS.GLOBAL]),

    PrismaModule,
    CloudinaryModule,
    MailModule,
    AuthModule,
    AdminModule,
    EnquiryModule,
    AttendanceModule,
    OfficeStaffModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}