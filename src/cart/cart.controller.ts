import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddItemDto } from './dto/add-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  get(@Req() req: any) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('items')
  addItem(@Req() req: any, @Body() dto: AddItemDto) {
    return this.cartService.addItem(req.user.userId, dto.productId, dto.quantity ?? 1);
  }

  @Patch('items/:id')
  updateItem(@Req() req: any, @Param('id') id: string, @Body('quantity') quantity: number) {
    return this.cartService.updateItem(req.user.userId, id, quantity);
  }

  @Delete('items/:id')
  removeItem(@Req() req: any, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.userId, id);
  }

  @Delete('clear')
  clear(@Req() req: any) {
    return this.cartService.clear(req.user.userId);
  }
}


