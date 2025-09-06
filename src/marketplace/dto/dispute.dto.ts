import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDisputeDto {
  @ApiProperty({ description: 'The ID of the order being disputed', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Title of the dispute', example: 'Product not as described' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detailed description of the dispute', example: 'The product received does not match the description provided. The condition is much worse than advertised.' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
