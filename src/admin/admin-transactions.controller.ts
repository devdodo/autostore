import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponse } from '../common/base-response';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import { PaymentIntentDto, TransactionAnalyticsDto } from '../common/dto/entity.dto';
import { TransactionFiltersDto } from '../common/dto/common.dto';

@ApiTags('Admin - Transactions')
@ApiBearerAuth('JWT-auth')
@Controller('admin/transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminTransactionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions with filtering' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by transaction status' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'orderId', required: false, description: 'Filter by order ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items to return' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of items to skip' })
  async list(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('orderId') orderId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<BaseResponse<any>> {
    try {
      const where: any = {};

      if (status) where.status = status;
      if (userId) where.userId = userId;
      if (orderId) where.orderId = orderId;
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const limitNum = limit ? parseInt(limit, 10) : 50;
      const offsetNum = offset ? parseInt(offset, 10) : 0;

      const transactions = await this.prisma.paymentIntent.findMany({
        where,
        take: limitNum,
        skip: offsetNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          order: { 
            select: { 
              id: true, 
              total: true, 
              status: true,
              items: {
                include: {
                  product: { select: { title: true, sku: true } }
                }
              }
            } 
          }
        }
      });

      const total = await this.prisma.paymentIntent.count({ where });

      return {
        success: true,
        message: 'Transactions retrieved',
        data: {
          transactions,
          pagination: {
            total,
            limit: limitNum,
            offset: offsetNum,
            hasMore: offsetNum + limitNum < total
          }
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to list transactions', error };
    }
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<BaseResponse<any>> {
    try {
      const where: any = {
        OR: [
          { reference: { contains: query, mode: 'insensitive' } },
          { user: { fullName: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } }
        ]
      };

      if (status) where.status = status;
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const limitNum = limit ? parseInt(limit, 10) : 50;
      const offsetNum = offset ? parseInt(offset, 10) : 0;

      const transactions = await this.prisma.paymentIntent.findMany({
        where,
        take: limitNum,
        skip: offsetNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          order: { 
            select: { 
              id: true, 
              total: true, 
              status: true,
              items: {
                include: {
                  product: { select: { title: true, sku: true } }
                }
              }
            } 
          }
        }
      });

      const total = await this.prisma.paymentIntent.count({ where });

      return {
        success: true,
        message: 'Search results retrieved',
        data: {
          transactions,
          pagination: {
            total,
            limit: limitNum,
            offset: offsetNum,
            hasMore: offsetNum + limitNum < total
          }
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to search transactions', error };
    }
  }

  @Get('analytics')
  async getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<BaseResponse<any>> {
    try {
      const where: any = {};
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        pendingTransactions,
        totalValue,
        averageValue,
        statusDistribution,
        monthlyData
      ] = await Promise.all([
        this.prisma.paymentIntent.count({ where }),
        this.prisma.paymentIntent.count({ where: { ...where, status: 'success' } }),
        this.prisma.paymentIntent.count({ where: { ...where, status: 'failed' } }),
        this.prisma.paymentIntent.count({ where: { ...where, status: 'pending' } }),
        this.prisma.paymentIntent.aggregate({
          _sum: { amount: true },
          where: { ...where, status: 'success' }
        }),
        this.prisma.paymentIntent.aggregate({
          _avg: { amount: true },
          where: { ...where, status: 'success' }
        }),
        this.prisma.paymentIntent.groupBy({
          by: ['status'],
          _count: { status: true },
          where
        }),
        this.getMonthlyTransactionData(where)
      ]);

      return {
        success: true,
        message: 'Transaction analytics retrieved',
        data: {
          totalTransactions,
          successfulTransactions,
          failedTransactions,
          pendingTransactions,
          totalValue: Number(totalValue._sum.amount || 0),
          averageValue: Number(averageValue._avg.amount || 0),
          successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0,
          statusDistribution,
          monthlyData
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to get transaction analytics', error };
    }
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<BaseResponse<any>> {
    try {
      const transaction = await this.prisma.paymentIntent.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, fullName: true, email: true, createdAt: true } },
          order: { 
            include: { 
              items: {
                include: {
                  product: { select: { id: true, title: true, sku: true, price: true } }
                }
              },
              history: { orderBy: { createdAt: 'desc' } }
            } 
          }
        }
      });

      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }

      return { success: true, message: 'Transaction retrieved', data: transaction };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to get transaction', error };
    }
  }

  private async getMonthlyTransactionData(where: any) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return this.prisma.paymentIntent.groupBy({
      by: ['createdAt'],
      _sum: { amount: true },
      _count: { id: true },
      where: {
        ...where,
        createdAt: { gte: sixMonthsAgo }
      },
      orderBy: { createdAt: 'asc' }
    });
  }
}
