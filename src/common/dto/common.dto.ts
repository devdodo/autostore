import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({ description: 'Search query string', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Number of items to return', required: false, default: 50 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({ description: 'Number of items to skip', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  offset?: number;
}

export class DateRangeQueryDto {
  @ApiProperty({ description: 'Start date (ISO string)', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date (ISO string)', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ProductFiltersDto extends SearchQueryDto {
  @ApiProperty({ description: 'Filter by make', required: false })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiProperty({ description: 'Filter by model', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: 'Filter by year', required: false })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({ description: 'Minimum price', required: false })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiProperty({ description: 'Maximum price', required: false })
  @IsOptional()
  @IsNumber()
  maxPrice?: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export class OrderFiltersDto extends SearchQueryDto {
  @ApiProperty({ description: 'Filter by order status', enum: OrderStatus, required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ description: 'Filter by user ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class DisputeFiltersDto extends SearchQueryDto {
  @ApiProperty({ description: 'Filter by dispute status', enum: DisputeStatus, required: false })
  @IsOptional()
  @IsEnum(DisputeStatus)
  status?: DisputeStatus;

  @ApiProperty({ description: 'Filter by user ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Filter by order ID', required: false })
  @IsOptional()
  @IsString()
  orderId?: string;
}

export class TransactionFiltersDto extends SearchQueryDto {
  @ApiProperty({ description: 'Filter by transaction status', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Filter by user ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Filter by order ID', required: false })
  @IsOptional()
  @IsString()
  orderId?: string;
}

export class UserFiltersDto extends SearchQueryDto {
  @ApiProperty({ description: 'Filter by user role', required: false })
  @IsOptional()
  @IsString()
  role?: string;
}
