import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsUUID, IsEmail, IsDateString } from 'class-validator';
import { OrderStatus, DisputeStatus } from './common.dto';

export class UserDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @ApiProperty({ description: 'User roles', type: [String] })
  roles: string[];

  @ApiProperty({ description: 'User creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'User last update date' })
  updatedAt: Date;
}

export class ProductDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product title' })
  title: string;

  @ApiProperty({ description: 'Product description' })
  description: string;

  @ApiProperty({ description: 'Product price' })
  price: number;

  @ApiProperty({ description: 'Product SKU' })
  sku: string;

  @ApiProperty({ description: 'Product make', required: false })
  make?: string;

  @ApiProperty({ description: 'Product model', required: false })
  model?: string;

  @ApiProperty({ description: 'Product year', required: false })
  year?: number;

  @ApiProperty({ description: 'Product creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Product last update date' })
  updatedAt: Date;
}

export class OrderItemDto {
  @ApiProperty({ description: 'Order item ID' })
  id: string;

  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Product details', type: ProductDto })
  product: ProductDto;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiProperty({ description: 'Price at time of order' })
  price: number;
}

export class OrderDto {
  @ApiProperty({ description: 'Order ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User details', type: UserDto })
  user: UserDto;

  @ApiProperty({ description: 'Order total' })
  total: number;

  @ApiProperty({ description: 'Order status', enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ description: 'Order items', type: [OrderItemDto] })
  items: OrderItemDto[];

  @ApiProperty({ description: 'Order creation date' })
  createdAt: Date;
}

export class DisputeDto {
  @ApiProperty({ description: 'Dispute ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User details', type: UserDto })
  user: UserDto;

  @ApiProperty({ description: 'Order ID' })
  orderId: string;

  @ApiProperty({ description: 'Order details', type: OrderDto })
  order: OrderDto;

  @ApiProperty({ description: 'Dispute status', enum: DisputeStatus })
  status: DisputeStatus;

  @ApiProperty({ description: 'Dispute title' })
  title: string;

  @ApiProperty({ description: 'Dispute description' })
  description: string;

  @ApiProperty({ description: 'Admin notes', required: false })
  adminNotes?: string;

  @ApiProperty({ description: 'Dispute creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Dispute last update date' })
  updatedAt: Date;
}

export class PaymentIntentDto {
  @ApiProperty({ description: 'Payment intent ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User details', type: UserDto })
  user: UserDto;

  @ApiProperty({ description: 'Payment reference' })
  reference: string;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({ description: 'Payment currency' })
  currency: string;

  @ApiProperty({ description: 'Payment status' })
  status: string;

  @ApiProperty({ description: 'Associated order ID', required: false })
  orderId?: string;

  @ApiProperty({ description: 'Order details', type: OrderDto, required: false })
  order?: OrderDto;

  @ApiProperty({ description: 'Payment creation date' })
  createdAt: Date;
}

export class DashboardMetricsDto {
  @ApiProperty({ description: 'Total number of users' })
  totalUsers: number;

  @ApiProperty({ description: 'Total number of orders' })
  totalOrders: number;

  @ApiProperty({ description: 'Total revenue' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total number of products' })
  totalProducts: number;

  @ApiProperty({ description: 'Total number of disputes' })
  totalDisputes: number;

  @ApiProperty({ description: 'Number of open disputes' })
  openDisputes: number;

  @ApiProperty({ description: 'Number of pending orders' })
  pendingOrders: number;

  @ApiProperty({ description: 'Number of completed orders' })
  completedOrders: number;

  @ApiProperty({ description: 'Recent orders', type: [OrderDto] })
  recentOrders: OrderDto[];

  @ApiProperty({ description: 'Recent disputes', type: [DisputeDto] })
  recentDisputes: DisputeDto[];

  @ApiProperty({ description: 'Top products', type: [ProductDto] })
  topProducts: ProductDto[];

  @ApiProperty({ description: 'Revenue by month' })
  revenueByMonth: any[];

  @ApiProperty({ description: 'Order status distribution' })
  orderStatusDistribution: any[];

  @ApiProperty({ description: 'User growth by month' })
  userGrowthByMonth: any[];
}

export class TransactionAnalyticsDto {
  @ApiProperty({ description: 'Total number of transactions' })
  totalTransactions: number;

  @ApiProperty({ description: 'Number of successful transactions' })
  successfulTransactions: number;

  @ApiProperty({ description: 'Number of failed transactions' })
  failedTransactions: number;

  @ApiProperty({ description: 'Number of pending transactions' })
  pendingTransactions: number;

  @ApiProperty({ description: 'Total transaction value' })
  totalTransactionValue: number;

  @ApiProperty({ description: 'Average transaction value' })
  averageTransactionValue: number;

  @ApiProperty({ description: 'Transaction success rate' })
  successRate: number;

  @ApiProperty({ description: 'Transactions by status' })
  transactionsByStatus: any[];

  @ApiProperty({ description: 'Transactions by month' })
  transactionsByMonth: any[];

  @ApiProperty({ description: 'Recent transactions', type: [PaymentIntentDto] })
  recentTransactions: PaymentIntentDto[];
}
