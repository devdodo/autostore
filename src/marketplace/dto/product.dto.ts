import { IsInt, IsNumber, IsOptional, IsString, Min, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product title', example: 'Toyota Camry 2020' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Product description', example: 'Well maintained Toyota Camry in excellent condition' })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Product price', example: 25000000 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ description: 'Product SKU', example: 'TOY-CAM-2020-001' })
  @IsString()
  sku!: string;

  @ApiProperty({ description: 'Product make', example: 'Toyota', required: false })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiProperty({ description: 'Product model', example: 'Camry', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: 'Product year', example: 2020, required: false })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiProperty({ description: 'Product brand', example: 'Toyota', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Car name', example: '2025 LAMBORGHINI URUS', required: false })
  @IsOptional()
  @IsString()
  carName?: string;

  @ApiProperty({ description: 'Body type', example: 'SUV', required: false })
  @IsOptional()
  @IsString()
  bodyType?: string;

  @ApiProperty({ description: 'Engine', example: 'V10', required: false })
  @IsOptional()
  @IsString()
  engine?: string;

  @ApiProperty({ description: 'Horsepower', example: '631', required: false })
  @IsOptional()
  @IsString()
  horsepower?: string;

  @ApiProperty({ description: 'Fuel type', example: 'Petrol', required: false })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiProperty({ description: 'Fuel capacity', example: '1.5', required: false })
  @IsOptional()
  @IsString()
  fuelCapacity?: string;

  @ApiProperty({ description: 'Engine displacement', example: '5.2', required: false })
  @IsOptional()
  @IsString()
  engineDisplacement?: string;

  @ApiProperty({ description: 'RPM', example: '8,000', required: false })
  @IsOptional()
  @IsString()
  rpm?: string;

  @ApiProperty({ description: 'Car price', example: '15000', required: false })
  @IsOptional()
  @IsString()
  carPrice?: string;

  @ApiProperty({ description: 'Car location', example: 'Lagos', required: false })
  @IsOptional()
  @IsString()
  carLocation?: string;

  @ApiProperty({ description: 'Transmission', example: 'Automatic', required: false })
  @IsOptional()
  @IsString()
  transmission?: string;

  @ApiProperty({ description: 'Colour', example: 'Silver', required: false })
  @IsOptional()
  @IsString()
  colour?: string;

  @ApiProperty({ description: 'Mileage', example: '43193', required: false })
  @IsOptional()
  @IsString()
  mileage?: string;

  @ApiProperty({ description: 'Product images', example: ['https://...'], required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateProductDto {
  @ApiProperty({ description: 'Product title', example: 'Toyota Camry 2020', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Product description', example: 'Well maintained Toyota Camry in excellent condition', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Product price', example: 25000000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ description: 'Product SKU', example: 'TOY-CAM-2020-001', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ description: 'Product make', example: 'Toyota', required: false })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiProperty({ description: 'Product model', example: 'Camry', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: 'Product year', example: 2020, required: false })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiProperty({ description: 'Product brand', example: 'Toyota', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Car name', example: '2025 LAMBORGHINI URUS', required: false })
  @IsOptional()
  @IsString()
  carName?: string;

  @ApiProperty({ description: 'Body type', example: 'SUV', required: false })
  @IsOptional()
  @IsString()
  bodyType?: string;

  @ApiProperty({ description: 'Engine', example: 'V10', required: false })
  @IsOptional()
  @IsString()
  engine?: string;

  @ApiProperty({ description: 'Horsepower', example: '631', required: false })
  @IsOptional()
  @IsString()
  horsepower?: string;

  @ApiProperty({ description: 'Fuel type', example: 'Petrol', required: false })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiProperty({ description: 'Fuel capacity', example: '1.5', required: false })
  @IsOptional()
  @IsString()
  fuelCapacity?: string;

  @ApiProperty({ description: 'Engine displacement', example: '5.2', required: false })
  @IsOptional()
  @IsString()
  engineDisplacement?: string;

  @ApiProperty({ description: 'RPM', example: '8,000', required: false })
  @IsOptional()
  @IsString()
  rpm?: string;

  @ApiProperty({ description: 'Car price', example: '15000', required: false })
  @IsOptional()
  @IsString()
  carPrice?: string;

  @ApiProperty({ description: 'Car location', example: 'Lagos', required: false })
  @IsOptional()
  @IsString()
  carLocation?: string;

  @ApiProperty({ description: 'Transmission', example: 'Automatic', required: false })
  @IsOptional()
  @IsString()
  transmission?: string;

  @ApiProperty({ description: 'Colour', example: 'Silver', required: false })
  @IsOptional()
  @IsString()
  colour?: string;

  @ApiProperty({ description: 'Mileage', example: '43193', required: false })
  @IsOptional()
  @IsString()
  mileage?: string;

  @ApiProperty({ description: 'Product images', example: ['https://...'], required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}


