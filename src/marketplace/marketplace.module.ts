import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';

@Module({
  controllers: [ProductsController, OrdersController, DisputesController],
  providers: [ProductsService, OrdersService, DisputesService],
})
export class MarketplaceModule {}


