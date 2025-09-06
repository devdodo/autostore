import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { OrdersService } from '../marketplace/orders.service';

@Module({
  providers: [UsersService, OrdersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}


