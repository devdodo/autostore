import { Body, Controller, Get, Patch, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from '../marketplace/orders.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
  ) {}

  // Profile endpoints use JWT to identify the user
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    const userId = req.user?.userId;
    return this.usersService.findPublicById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    const userId = req.user?.userId;
    return this.usersService.update(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  orders(@Req() req: any) {
    const userId = req.user?.userId;
    return this.ordersService.listByUser(userId);
  }
}


