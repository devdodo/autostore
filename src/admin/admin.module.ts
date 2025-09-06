import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminUsersController } from './admin.users.controller';
import { AdminProductsController } from './admin.products.controller';
import { AdminOrdersController } from './admin.orders.controller';
import { AdminDisputesController } from './admin.disputes.controller';
import { AdminTransactionsController } from './admin-transactions.controller';
import { AdminAnalyticsService } from './admin-analytics.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../marketplace/products.service';

@Module({
  controllers: [
    AdminController, 
    AdminUsersController, 
    AdminProductsController, 
    AdminOrdersController, 
    AdminDisputesController,
    AdminTransactionsController
  ],
  providers: [
    AdminAnalyticsService,
    UsersService,
    ProductsService
  ],
})
export class AdminModule {}


