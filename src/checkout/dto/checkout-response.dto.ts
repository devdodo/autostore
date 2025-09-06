import { ApiProperty } from '@nestjs/swagger';

export class CheckoutResponseDto {
  @ApiProperty({ 
    description: 'Paystack payment URL', 
    example: 'https://checkout.paystack.com/abc123',
    type: String
  })
  authorization_url!: string;

  @ApiProperty({ 
    description: 'Payment reference', 
    example: 'ref_123456789',
    type: String
  })
  reference!: string;
}
