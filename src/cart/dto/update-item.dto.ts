import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemDto {
  @ApiProperty({ 
    description: 'New quantity for the cart item', 
    example: 3,
    minimum: 1,
    type: Number
  })
  @IsNumber()
  @Min(1)
  quantity!: number;
}
