import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponse } from '../common/base-response';

export interface DashboardMetrics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalDisputes: number;
  openDisputes: number;
  pendingOrders: number;
  completedOrders: number;
  recentOrders: any[];
  recentDisputes: any[];
  topProducts: any[];
  revenueByMonth: any[];
  orderStatusDistribution: any[];
  userGrowthByMonth: any[];
}

export interface TransactionAnalytics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalTransactionValue: number;
  averageTransactionValue: number;
  transactionsByStatus: any[];
  transactionsByMonth: any[];
  recentTransactions: any[];
}

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(): Promise<BaseResponse<DashboardMetrics>> {
    try {
      const [
        totalUsers,
        totalOrders,
        totalProducts,
        totalDisputes,
        openDisputes,
        pendingOrders,
        completedOrders,
        recentOrders,
        recentDisputes,
        topProducts,
        revenueByMonth,
        orderStatusDistribution,
        userGrowthByMonth
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.order.count(),
        this.prisma.product.count(),
        this.prisma.dispute.count(),
        this.prisma.dispute.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
        this.prisma.order.count({ where: { status: 'PENDING' } }),
        this.prisma.order.count({ where: { status: 'DELIVERED' } }),
        this.getRecentOrders(),
        this.getRecentDisputes(),
        this.getTopProducts(),
        this.getRevenueByMonth(),
        this.getOrderStatusDistribution(),
        this.getUserGrowthByMonth()
      ]);

      const totalRevenue = await this.getTotalRevenue();

      return {
        success: true,
        message: 'Dashboard metrics retrieved',
        data: {
          totalUsers,
          totalOrders,
          totalRevenue,
          totalProducts,
          totalDisputes,
          openDisputes,
          pendingOrders,
          completedOrders,
          recentOrders,
          recentDisputes,
          topProducts,
          revenueByMonth,
          orderStatusDistribution,
          userGrowthByMonth
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to get dashboard metrics', error };
    }
  }

  async getTransactionAnalytics(): Promise<BaseResponse<TransactionAnalytics>> {
    try {
      const [
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        pendingTransactions,
        transactionsByStatus,
        transactionsByMonth,
        recentTransactions
      ] = await Promise.all([
        this.prisma.paymentIntent.count(),
        this.prisma.paymentIntent.count({ where: { status: 'success' } }),
        this.prisma.paymentIntent.count({ where: { status: 'failed' } }),
        this.prisma.paymentIntent.count({ where: { status: 'pending' } }),
        this.getTransactionsByStatus(),
        this.getTransactionsByMonth(),
        this.getRecentTransactions()
      ]);

      const totalTransactionValue = await this.getTotalTransactionValue();
      const averageTransactionValue = totalTransactions > 0 ? totalTransactionValue / totalTransactions : 0;

      return {
        success: true,
        message: 'Transaction analytics retrieved',
        data: {
          totalTransactions,
          successfulTransactions,
          failedTransactions,
          pendingTransactions,
          totalTransactionValue,
          averageTransactionValue,
          transactionsByStatus,
          transactionsByMonth,
          recentTransactions
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to get transaction analytics', error };
    }
  }

  private async getTotalRevenue(): Promise<number> {
    const result = await this.prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } }
    });
    return Number(result._sum.total || 0);
  }

  private async getTotalTransactionValue(): Promise<number> {
    const result = await this.prisma.paymentIntent.aggregate({
      _sum: { amount: true },
      where: { status: 'success' }
    });
    return Number(result._sum.amount || 0);
  }

  private async getRecentOrders(limit = 5) {
    return this.prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, fullName: true, email: true } },
        items: { 
          take: 3,
          select: { 
            quantity: true, 
            price: true,
            product: { select: { title: true, sku: true } } 
          } 
        }
      }
    });
  }

  private async getRecentDisputes(limit = 5) {
    return this.prisma.dispute.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, fullName: true, email: true } },
        order: { select: { id: true, total: true, status: true } }
      }
    });
  }

  private async getTopProducts(limit = 5) {
    return this.prisma.product.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        sku: true
      }
    });
  }

  private async getRevenueByMonth() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return this.prisma.order.groupBy({
      by: ['createdAt'],
      _sum: { total: true },
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  private async getOrderStatusDistribution() {
    return this.prisma.order.groupBy({
      by: ['status'],
      _count: { status: true }
    });
  }

  private async getUserGrowthByMonth() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return this.prisma.user.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: { createdAt: { gte: sixMonthsAgo } },
      orderBy: { createdAt: 'asc' }
    });
  }

  private async getTransactionsByStatus() {
    return this.prisma.paymentIntent.groupBy({
      by: ['status'],
      _count: { status: true }
    });
  }

  private async getTransactionsByMonth() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return this.prisma.paymentIntent.groupBy({
      by: ['createdAt'],
      _sum: { amount: true },
      _count: { id: true },
      where: { createdAt: { gte: sixMonthsAgo } },
      orderBy: { createdAt: 'asc' }
    });
  }

  private async getRecentTransactions(limit = 10) {
    return this.prisma.paymentIntent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        order: { select: { id: true, total: true, status: true } }
      }
    });
  }
}
