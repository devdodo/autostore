import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('me')
  listMine(@Req() req: any) {
    const userId = req.user?.userId;
    return this.ordersService.listByUser(userId);
  }
}


