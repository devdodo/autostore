import { Injectable } from '@nestjs/common';
import { BaseResponse } from '../common/base-response';
import { PrismaService } from '../prisma/prisma.service';

export interface Dispute {
  id: string;
  userId: string;
  orderId: string;
  status: string;
  title: string;
  description: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  order?: {
    id: string;
    total: number;
    status: string;
    createdAt: Date;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        id: string;
        title: string;
        sku: string;
      };
    }>;
  };
}

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: { orderId: string; title: string; description: string }): Promise<BaseResponse<Dispute>> {
    try {
      // Verify the order belongs to the user
      const order = await this.prisma.order.findFirst({
        where: { id: dto.orderId, userId }
      });

      if (!order) {
        return { success: false, message: 'Order not found or does not belong to you' };
      }

      // Check if there's already an open dispute for this order
      const existingDispute = await this.prisma.dispute.findFirst({
        where: { orderId: dto.orderId, status: { in: ['OPEN', 'IN_PROGRESS'] } }
      });

      if (existingDispute) {
        return { success: false, message: 'There is already an open dispute for this order' };
      }

      const dispute = await this.prisma.dispute.create({
        data: {
          userId,
          orderId: dto.orderId,
          title: dto.title,
          description: dto.description,
        },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      title: true,
                      sku: true,
                    }
                  }
                }
              }
            }
          }
        }
      });

      return { success: true, message: 'Dispute created successfully', data: dispute as any };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to create dispute', error };
    }
  }

  async listByUser(userId: string): Promise<BaseResponse<Dispute[]>> {
    try {
      const disputes = await this.prisma.dispute.findMany({
        where: { userId },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      title: true,
                      sku: true,
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return { success: true, message: 'ok', data: disputes as any };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to list disputes', error };
    }
  }

  async getById(userId: string, disputeId: string): Promise<BaseResponse<Dispute>> {
    try {
      const dispute = await this.prisma.dispute.findFirst({
        where: { id: disputeId, userId },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      title: true,
                      sku: true,
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!dispute) {
        return { success: false, message: 'Dispute not found' };
      }

      return { success: true, message: 'ok', data: dispute as any };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to get dispute', error };
    }
  }
}
