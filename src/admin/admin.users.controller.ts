import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponse } from '../common/base-response';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<BaseResponse<any>> {
    try {
      const where: any = {};

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (role) {
        where.roles = { has: role };
      }
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const limitNum = limit ? parseInt(limit, 10) : 50;
      const offsetNum = offset ? parseInt(offset, 10) : 0;

      const users = await this.prisma.user.findMany({
        where,
        take: limitNum,
        skip: offsetNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          roles: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              disputes: true
            }
          }
        }
      });

      const total = await this.prisma.user.count({ where });

      return {
        success: true,
        message: 'Users retrieved',
        data: {
          users,
          pagination: {
            total,
            limit: limitNum,
            offset: offsetNum,
            hasMore: offsetNum + limitNum < total
          }
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to list users', error };
    }
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('role') role?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<BaseResponse<any>> {
    try {
      const where: any = {
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      };

      if (role) {
        where.roles = { has: role };
      }
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const limitNum = limit ? parseInt(limit, 10) : 50;
      const offsetNum = offset ? parseInt(offset, 10) : 0;

      const users = await this.prisma.user.findMany({
        where,
        take: limitNum,
        skip: offsetNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          roles: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              disputes: true
            }
          }
        }
      });

      const total = await this.prisma.user.count({ where });

      return {
        success: true,
        message: 'Search results retrieved',
        data: {
          users,
          pagination: {
            total,
            limit: limitNum,
            offset: offsetNum,
            hasMore: offsetNum + limitNum < total
          }
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to search users', error };
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
        totalUsers,
        activeUsers,
        newUsers,
        roleDistribution,
        monthlyData
      ] = await Promise.all([
        this.prisma.user.count({ where }),
        this.prisma.user.count({ 
          where: { 
            ...where,
            orders: { some: {} }
          } 
        }),
        this.prisma.user.count({ 
          where: { 
            ...where,
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          } 
        }),
        this.getRoleDistribution(where),
        this.getMonthlyUserData(where)
      ]);

      return {
        success: true,
        message: 'User analytics retrieved',
        data: {
          totalUsers,
          activeUsers,
          newUsers,
          activityRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
          roleDistribution,
          monthlyData
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to get user analytics', error };
    }
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<BaseResponse<any>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          fullName: true,
          roles: true,
          createdAt: true,
          updatedAt: true,
          orders: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              total: true,
              status: true,
              createdAt: true
            }
          },
          disputes: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              orders: true,
              disputes: true
            }
          }
        }
      });

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      return { success: true, message: 'User retrieved', data: user };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to get user', error };
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  private async getRoleDistribution(where: any) {
    const users = await this.prisma.user.findMany({
      where,
      select: { roles: true }
    });

    const distribution: any = {};
    users.forEach(user => {
      user.roles.forEach(role => {
        distribution[role] = (distribution[role] || 0) + 1;
      });
    });

    return Object.entries(distribution).map(([role, count]) => ({
      role,
      count
    }));
  }

  private async getMonthlyUserData(where: any) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return this.prisma.user.groupBy({
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


