import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { BaseResponse } from '../common/base-response';
import { EmailService } from '../email/email.service';
import { ErrorHandlerUtil } from '../common/error-handler.util';

@Injectable()
export class CheckoutService {
  private readonly paystackBase = 'https://api.paystack.co';
  private readonly paystackKey = process.env.PAYSTACK_SECRET_KEY || '';

  constructor(private readonly prisma: PrismaService, private readonly email: EmailService) {}

  async initiate(userId: string): Promise<BaseResponse<{ authorization_url: string; reference: string }>> {
    const result = await ErrorHandlerUtil.handleAsync(async () => {
      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });
      if (!cart || cart.items.length === 0) throw new BadRequestException('Cart is empty');
      
      const amount = cart.items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new BadRequestException('User not found');

      const koboAmount = Math.round(amount * 100);
      const initRes = await axios.post(
        `${this.paystackBase}/transaction/initialize`,
        { email: user.email, amount: koboAmount },
        { headers: { Authorization: `Bearer ${this.paystackKey}` } },
      );
      const { authorization_url, reference } = initRes.data.data;

      await this.prisma.paymentIntent.create({
        data: { userId, amount, reference, status: 'pending' },
      });
      
      await this.email.sendMail(user.email, 'Order Payment Initiated', {
        templateId: 'payment_initiated',
        params: { 
          fullName: user.fullName,
          reference,
          amount: amount
        }
      });
      
      return { authorization_url, reference };
    }, 'Payment initiation');

    if (result.success) {
      return { success: true, message: 'Payment initiated', data: result.data };
    } else {
      return { success: false, message: result.message || 'Failed to initiate payment' };
    }
  }

  async handleWebhook(payload: any): Promise<BaseResponse<{ orderId?: string }>> {
    if (payload.event !== 'charge.success') {
      return { success: true, message: 'ignored' };
    }

    const result = await ErrorHandlerUtil.handleAsync(async () => {
      const reference = payload.data.reference as string;
      const intent = await this.prisma.paymentIntent.findUnique({ where: { reference } });
      if (!intent || intent.status === 'succeeded') return { orderId: undefined };

      const cart = await this.prisma.cart.findUnique({
        where: { userId: intent.userId },
        include: { items: true },
      });
      
      const order = await this.prisma.order.create({
        data: {
          userId: intent.userId,
          total: intent.amount,
          items: {
            create: await Promise.all(
              (cart?.items || []).map(async (ci) => {
                const product = await this.prisma.product.findUnique({ where: { id: ci.productId } });
                return {
                  productId: ci.productId,
                  quantity: ci.quantity,
                  price: product?.price || 0,
                };
              }),
            ),
          },
        },
      });

      await this.prisma.paymentIntent.update({ 
        where: { reference }, 
        data: { status: 'succeeded', orderId: order.id } 
      });
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart?.id } });
      
      const user = await this.prisma.user.findUnique({ where: { id: intent.userId } });
      if (user) {
        await this.email.sendOrderConfirmationEmail(user.email, {
          fullName: user.fullName,
          orderId: order.id,
          total: Number(intent.amount),
          items: cart?.items || []
        });
      }
      
      return { orderId: order.id };
    }, 'Webhook handling');

    if (result.success) {
      return { success: true, message: 'ok', data: result.data };
    } else {
      return { success: false, message: result.message || 'Webhook handling failed' };
    }
  }
}


