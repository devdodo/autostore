import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import { CartDto } from '../common/dto/entity.dto';

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully', type: CartDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  get(@Req() req: any) {
    return this.cartService.getCart(req.user.userId); 
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiBody({ type: AddItemDto })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully', type: CartDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addItem(@Req() req: any, @Body() dto: AddItemDto) {
    return this.cartService.addItem(req.user.userId, dto.productId, dto.quantity ?? 1);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update item quantity in cart' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  @ApiBody({ type: UpdateItemDto })
  @ApiResponse({ status: 200, description: 'Item quantity updated successfully', type: CartDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  updateItem(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.cartService.updateItem(req.user.userId, id, dto.quantity);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  @ApiResponse({ status: 200, description: 'Item removed from cart successfully', type: CartDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  removeItem(@Req() req: any, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.userId, id);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully', type: CartDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  clear(@Req() req: any) {
    return this.cartService.clear(req.user.userId);
  }
}


