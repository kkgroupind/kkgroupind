import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { Roles } from '../../../common';
import { Role } from '../../../database';
import { DashboardService } from './dashboard.service';
import { DashboardRecentActivityDto, DashboardTrendsDto, DashboardPerformanceDto } from './dto';

@Controller(['admin/dashboard', 'dashboard/admin'])
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(Role.SUPER_ADMIN)
  @Get('overview')
  @HttpCode(HttpStatus.OK)
  async getOverview(
    @Query() trendsDto: DashboardTrendsDto,
    @Query() activityDto: DashboardRecentActivityDto,
  ) {
    return this.dashboardService.getOverview(trendsDto, activityDto);
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('trends')
  @HttpCode(HttpStatus.OK)
  async getTrends(@Query() query: DashboardTrendsDto) {
    return this.dashboardService.getTrends(query);
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('roles')
  @HttpCode(HttpStatus.OK)
  async getRoles() {
    return this.dashboardService.getRolesBreakdown();
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('recent-activity')
  @HttpCode(HttpStatus.OK)
  async getRecentActivity(@Query() query: DashboardRecentActivityDto) {
    return this.dashboardService.getRecentActivity(query);
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('performance')
  @HttpCode(HttpStatus.OK)
  async getPerformance(@Query() query: DashboardPerformanceDto) {
    return this.dashboardService.getPerformance(query);
  }
}
