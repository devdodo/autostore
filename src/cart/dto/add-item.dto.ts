import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddItemDto {
  @ApiProperty({ 
    description: 'Product ID to add to cart', 
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @IsString()
  productId!: string;

  @ApiProperty({ 
    description: 'Quantity to add (default: 1)', 
    example: 2, 
    required: false, 
    minimum: 1,
    type: Number
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}


