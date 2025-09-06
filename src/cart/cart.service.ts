import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponse } from '../common/base-response';
import { ErrorHandlerUtil } from '../common/error-handler.util';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCart(userId: string) {
    const existing = await this.prisma.cart.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.cart.create({ data: { userId } });
  }

  async getCart(userId: string): Promise<BaseResponse<any>> {
    const result = await ErrorHandlerUtil.handleAsync(async () => {
      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });
      return cart;
    }, 'Get cart');

    if (result.success) {
      return { success: true, message: 'ok', data: result.data };
    } else {
      return { success: false, message: result.message || 'Failed to fetch cart' };
    }
  }

  async addItem(userId: string, productId: string, quantity = 1): Promise<BaseResponse<any>> {
    const result = await ErrorHandlerUtil.handleAsync(async () => {
      const cart = await this.getOrCreateCart(userId);
      const product = await this.prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw new NotFoundException('Product not found');
      
      const existing = await this.prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } });
      let item;
      if (existing) {
        item = await this.prisma.cartItem.update({ 
          where: { id: existing.id }, 
          data: { quantity: existing.quantity + quantity } 
        });
      } else {
        item = await this.prisma.cartItem.create({ 
          data: { cartId: cart.id, productId, quantity } 
        });
      }
      return item;
    }, 'Add item to cart');

    if (result.success) {
      return { success: true, message: 'Item added', data: result.data };
    } else {
      return { success: false, message: result.message || 'Failed to add item' };
    }
  }

  async updateItem(userId: string, itemId: string, quantity: number): Promise<BaseResponse<any>> {
    const result = await ErrorHandlerUtil.handleAsync(async () => {
      const cart = await this.getOrCreateCart(userId);
      const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
      if (!item || item.cartId !== cart.id) throw new NotFoundException('Item not found');
      
      const updated = await this.prisma.cartItem.update({ 
        where: { id: itemId }, 
        data: { quantity } 
      });
      return updated;
    }, 'Update cart item');

    if (result.success) {
      return { success: true, message: 'Item updated', data: result.data };
    } else {
      return { success: false, message: result.message || 'Failed to update item' };
    }
  }

  async removeItem(userId: string, itemId: string): Promise<BaseResponse<null>> {
    const result = await ErrorHandlerUtil.handleAsync(async () => {
      const cart = await this.getOrCreateCart(userId);
      const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
      if (!item || item.cartId !== cart.id) throw new NotFoundException('Item not found');
      
      await this.prisma.cartItem.delete({ where: { id: itemId } });
      return null;
    }, 'Remove cart item');

    if (result.success) {
      return { success: true, message: 'Item removed' };
    } else {
      return { success: false, message: result.message || 'Failed to remove item' };
    }
  }

  async clear(userId: string): Promise<BaseResponse<any>> {
    const result = await ErrorHandlerUtil.handleAsync(async () => {
      const cart = await this.getOrCreateCart(userId);
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      return cart;
    }, 'Clear cart');

    if (result.success) {
      return { success: true, message: 'Cart cleared', data: result.data };
    } else {
      return { success: false, message: result.message || 'Failed to clear cart' };
    }
  }
}


