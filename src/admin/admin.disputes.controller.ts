import { Body, Controller, Get, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponse } from '../common/base-response';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import { DisputeDto } from '../common/dto/entity.dto';

@ApiTags('Admin - Disputes')
@ApiBearerAuth('JWT-auth')
@Controller('admin/disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminDisputesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
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

      const disputes = await this.prisma.dispute.findMany({
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

      const total = await this.prisma.dispute.count({ where });

      return {
        success: true,
        message: 'Disputes retrieved',
        data: {
          disputes,
          pagination: {
            total,
            limit: limitNum,
            offset: offsetNum,
            hasMore: offsetNum + limitNum < total
          }
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to list disputes', error };
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
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
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

      const disputes = await this.prisma.dispute.findMany({
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

      const total = await this.prisma.dispute.count({ where });

      return {
        success: true,
        message: 'Search results retrieved',
        data: {
          disputes,
          pagination: {
            total,
            limit: limitNum,
            offset: offsetNum,
            hasMore: offsetNum + limitNum < total
          }
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to search disputes', error };
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
        totalDisputes,
        openDisputes,
        inProgressDisputes,
        resolvedDisputes,
        rejectedDisputes,
        statusDistribution,
        monthlyData
      ] = await Promise.all([
        this.prisma.dispute.count({ where }),
        this.prisma.dispute.count({ where: { ...where, status: 'OPEN' } }),
        this.prisma.dispute.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        this.prisma.dispute.count({ where: { ...where, status: 'RESOLVED' } }),
        this.prisma.dispute.count({ where: { ...where, status: 'REJECTED' } }),
        this.prisma.dispute.groupBy({
          by: ['status'],
          _count: { status: true },
          where
        }),
        this.getMonthlyDisputeData(where)
      ]);

      return {
        success: true,
        message: 'Dispute analytics retrieved',
        data: {
          totalDisputes,
          openDisputes,
          inProgressDisputes,
          resolvedDisputes,
          rejectedDisputes,
          resolutionRate: totalDisputes > 0 ? ((resolvedDisputes + rejectedDisputes) / totalDisputes) * 100 : 0,
          statusDistribution,
          monthlyData
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to get dispute analytics', error };
    }
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<BaseResponse<any>> {
    try {
      const dispute = await this.prisma.dispute.findUnique({ 
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
              history: { orderBy: { createdAt: 'desc' } },
              paymentIntents: { orderBy: { createdAt: 'desc' } }
            } 
          }
        }
      });
      if (!dispute) return { success: false, message: 'Dispute not found' };
      return { success: true, message: 'ok', data: dispute };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to get dispute', error };
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { status: string; adminNotes?: string }): Promise<BaseResponse<any>> {
    try {
      const updated = await this.prisma.dispute.update({ 
        where: { id }, 
        data: { 
          status: body.status as any, 
          adminNotes: body.adminNotes,
          updatedAt: new Date()
        } 
      });
      return { success: true, message: 'Dispute updated', data: updated };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to update dispute', error };
    }
  }

  private async getMonthlyDisputeData(where: any) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return this.prisma.dispute.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: {
        ...where,
        createdAt: { gte: sixMonthsAgo }
      },
      orderBy: { createdAt: 'asc' }
    });
  }
}


