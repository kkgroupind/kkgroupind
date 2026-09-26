import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FinanceService } from './finance.service';
import {
  CreateTransactionDto,
  QueryTransactionDto,
  UpdateTransactionDto,
  VerifyTransactionDto,
} from './dto';
import { Role } from '../../database';
import { CurrentUser, RATE_LIMITS, Roles } from '../../common';

@Throttle({ default: RATE_LIMITS.FINANCE })
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF)
  @Get('summary')
  async getSummary(
    @Query('month') month?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('serviceType') serviceType?: string,
  ) {
    return this.financeService.getSummary({
      month,
      startDate,
      endDate,
      serviceType,
    });
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF)
  @Get('calendar')
  async getCalendarFeed(@Query('month') month?: string) {
    return this.financeService.getCalendarFeed(month);
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF)
  @Get('transactions')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getTransactions(@Query() query: QueryTransactionDto) {
    return this.financeService.getTransactions(query);
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF)
  @Get('transactions/:id')
  async getTransactionById(@Param('id') id: string) {
    return this.financeService.getTransactionById(id);
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF)
  @Post('transactions')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createTransaction(
    @CurrentUser() user: any,
    @Body() dto: CreateTransactionDto,
    @Req() req: any,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.financeService.createTransaction(user, dto, ipAddress);
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF)
  @Patch('transactions/:id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateTransaction(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateTransactionDto,
    @Req() req: any,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.financeService.updateTransaction(id, user, dto, ipAddress);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch('transactions/:id/verify')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async verifyTransaction(
    @Param('id') id: string,
    @CurrentUser() adminUser: any,
    @Body() dto: VerifyTransactionDto,
    @Req() req: any,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.financeService.verifyTransaction(id, adminUser, dto, ipAddress);
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete('transactions/:id')
  @HttpCode(HttpStatus.OK)
  async deleteTransaction(
    @Param('id') id: string,
    @CurrentUser() adminUser: any,
    @Req() req: any,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.financeService.deleteTransaction(id, adminUser, ipAddress);
  }
}
