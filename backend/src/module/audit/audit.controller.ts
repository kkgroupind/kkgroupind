import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuditService } from './audit.service';
import { QueryAuditDto } from './dto/query-audit.dto';
import { Role } from '../../database';
import { CurrentUser, RATE_LIMITS, Roles } from '../../common';

@Throttle({ default: RATE_LIMITS.AUDIT })
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF, Role.WORKER, Role.CUSTOMER)
  @Get('logs')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getLogs(
    @CurrentUser() user: any,
    @Query() query: QueryAuditDto,
  ) {
    return this.auditService.getLogs(user, query);
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF, Role.WORKER, Role.CUSTOMER)
  @Get('my-logs')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getMyLogs(
    @CurrentUser() user: any,
    @Query() query: QueryAuditDto,
  ) {
    return this.auditService.getMyLogs(user?.id, query);
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('stats')
  async getStats() {
    return this.auditService.getStats();
  }
}
