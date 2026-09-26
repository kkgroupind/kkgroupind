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
import { RATE_LIMITS, Roles } from '../../common';

@Roles(Role.SUPER_ADMIN)
@Throttle({ default: RATE_LIMITS.AUDIT })
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getLogs(@Query() query: QueryAuditDto) {
    return this.auditService.getLogs(query);
  }

  @Get('stats')
  async getStats() {
    return this.auditService.getStats();
  }
}
