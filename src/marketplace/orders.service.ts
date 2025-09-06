import { Injectable } from '@nestjs/common';
import { BaseResponse } from '../common/base-response';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  listByUser(userId: string): Promise<BaseResponse<any>> | BaseResponse<any> {
    return this.prisma.order
      .findMany({
        where: { userId },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      })
      .then((orders) => ({ success: true, message: 'ok', data: orders }))
      .catch((error) => ({ success: false, message: error?.message || 'Failed to list orders', error }));
  }
}


