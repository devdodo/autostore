import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { RolesGuard } from '../common/roles.guard';
import { AdminAnalyticsService } from './admin-analytics.service';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import { DashboardMetricsDto, TransactionAnalyticsDto } from '../common/dto/entity.dto';

@ApiTags('Admin - Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard metrics and analytics' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics retrieved successfully', type: DashboardMetricsDto })
  async dashboard() {
    return this.analyticsService.getDashboardMetrics();
  }

  @Get('analytics/transactions')
  @ApiOperation({ summary: 'Get transaction analytics' })
  @ApiResponse({ status: 200, description: 'Transaction analytics retrieved successfully', type: TransactionAnalyticsDto })
  async getTransactionAnalytics() {
    return this.analyticsService.getTransactionAnalytics();
  }
}


