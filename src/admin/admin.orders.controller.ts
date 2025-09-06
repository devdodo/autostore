import { Body, Controller, Get, Param, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponse } from '../common/base-response';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminOrdersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<BaseResponse<any>> {
    try {
      const where: any = {};

      if (status) where.status = status;
      if (userId) where.userId = userId;
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const limitNum = limit ? parseInt(limit, 10) : 50;
      const offsetNum = offset ? parseInt(offset, 10) : 0;

      const orders = await this.prisma.order.findMany({
        where,
        take: limitNum,
        skip: offsetNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          items: { include: { product: { select: { title: true, sku: true, price: true } } } },
          paymentIntents: { select: { id: true, amount: true, status: true, reference: true } },
          disputes: { select: { id: true, status: true, title: true } }
        }
      });

      const total = await this.prisma.order.count({ where });

      return {
        success: true,
        message: 'Orders retrieved',
        data: {
          orders,
          pagination: {
            total,
            limit: limitNum,
            offset: offsetNum,
            hasMore: offsetNum + limitNum < total
          }
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to list orders', error };
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
          { id: { contains: query, mode: 'insensitive' } },
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

      const orders = await this.prisma.order.findMany({
        where,
        take: limitNum,
        skip: offsetNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          items: { include: { product: { select: { title: true, sku: true, price: true } } } },
          paymentIntents: { select: { id: true, amount: true, status: true, reference: true } },
          disputes: { select: { id: true, status: true, title: true } }
        }
      });

      const total = await this.prisma.order.count({ where });

      return {
        success: true,
        message: 'Search results retrieved',
        data: {
          orders,
          pagination: {
            total,
            limit: limitNum,
            offset: offsetNum,
            hasMore: offsetNum + limitNum < total
          }
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to search orders', error };
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
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        refundedOrders,
        totalRevenue,
        averageOrderValue,
        statusDistribution,
        monthlyData
      ] = await Promise.all([
        this.prisma.order.count({ where }),
        this.prisma.order.count({ where: { ...where, status: 'PENDING' } }),
        this.prisma.order.count({ where: { ...where, status: 'PROCESSING' } }),
        this.prisma.order.count({ where: { ...where, status: 'SHIPPED' } }),
        this.prisma.order.count({ where: { ...where, status: 'DELIVERED' } }),
        this.prisma.order.count({ where: { ...where, status: 'CANCELLED' } }),
        this.prisma.order.count({ where: { ...where, status: 'REFUNDED' } }),
        this.prisma.order.aggregate({
          _sum: { total: true },
          where: { ...where, status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } }
        }),
        this.prisma.order.aggregate({
          _avg: { total: true },
          where: { ...where, status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } }
        }),
        this.prisma.order.groupBy({
          by: ['status'],
          _count: { status: true },
          where
        }),
        this.getMonthlyOrderData(where)
      ]);

      return {
        success: true,
        message: 'Order analytics retrieved',
        data: {
          totalOrders,
          pendingOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          refundedOrders,
          totalRevenue: Number(totalRevenue._sum.total || 0),
          averageOrderValue: Number(averageOrderValue._avg.total || 0),
          completionRate: totalOrders > 0 ? ((deliveredOrders + refundedOrders) / totalOrders) * 100 : 0,
          statusDistribution,
          monthlyData
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to get order analytics', error };
    }
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<BaseResponse<any>> {
    try {
      const order = await this.prisma.order.findUnique({ 
        where: { id }, 
        include: { 
          user: { select: { id: true, fullName: true, email: true, createdAt: true } },
          items: { include: { product: { select: { id: true, title: true, sku: true, price: true } } } },
          history: { orderBy: { createdAt: 'desc' } },
          paymentIntents: { orderBy: { createdAt: 'desc' } },
          disputes: { include: { user: { select: { fullName: true, email: true } } } }
        } 
      });
      if (!order) return { success: false, message: 'Order not found' };
      return { success: true, message: 'ok', data: order };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to get order', error };
    }
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string; note?: string }): Promise<BaseResponse<any>> {
    try {
      const updated = await this.prisma.order.update({ where: { id }, data: { status: body.status as any } });
      await this.prisma.orderHistory.create({ data: { orderId: id, status: body.status as any, note: body.note } });
      return { success: true, message: 'Status updated', data: updated };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to update status', error };
    }
  }

  private async getMonthlyOrderData(where: any) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return this.prisma.order.groupBy({
      by: ['createdAt'],
      _sum: { total: true },
      _count: { id: true },
      where: {
        ...where,
        createdAt: { gte: sixMonthsAgo }
      },
      orderBy: { createdAt: 'asc' }
    });
  }
}


