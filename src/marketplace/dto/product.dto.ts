import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
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
}


