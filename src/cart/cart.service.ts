import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponse } from '../common/base-response';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCart(userId: string) {
    const existing = await this.prisma.cart.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.cart.create({ data: { userId } });
  }

  async getCart(userId: string): Promise<BaseResponse<any>> {
    try {
      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });
      return { success: true, message: 'ok', data: cart };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to fetch cart', error };
    }
  }

  async addItem(userId: string, productId: string, quantity = 1): Promise<BaseResponse<any>> {
    try {
      const cart = await this.getOrCreateCart(userId);
      const product = await this.prisma.product.findUnique({ where: { id: productId } });
      if (!product) return { success: false, message: 'Product not found' };
      const existing = await this.prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } });
      let item;
      if (existing) {
        item = await this.prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
      } else {
        item = await this.prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
      }
      return { success: true, message: 'Item added', data: item };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to add item', error };
    }
  }

  async updateItem(userId: string, itemId: string, quantity: number): Promise<BaseResponse<any>> {
    try {
      const cart = await this.getOrCreateCart(userId);
      const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
      if (!item || item.cartId !== cart.id) return { success: false, message: 'Item not found' };
      const updated = await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
      return { success: true, message: 'Item updated', data: updated };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to update item', error };
    }
  }

  async removeItem(userId: string, itemId: string): Promise<BaseResponse<null>> {
    try {
      const cart = await this.getOrCreateCart(userId);
      const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
      if (!item || item.cartId !== cart.id) return { success: false, message: 'Item not found' };
      await this.prisma.cartItem.delete({ where: { id: itemId } });
      return { success: true, message: 'Item removed' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to remove item', error };
    }
  }

  async clear(userId: string): Promise<BaseResponse<any>> {
    try {
      const cart = await this.getOrCreateCart(userId);
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      return { success: true, message: 'Cart cleared', data: cart };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to clear cart', error };
    }
  }
}


