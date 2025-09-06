import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BaseResponseDto } from '../common/dto/base-response.dto';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Initiate checkout process' })
  @ApiResponse({ 
    status: 200, 
    description: 'Checkout initiated successfully', 
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            authorization_url: { type: 'string', description: 'Paystack payment URL' },
            reference: { type: 'string', description: 'Payment reference' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  initiate(@Req() req: any) {
    return this.checkoutService.initiate(req.user.userId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Paystack webhook' })
  @ApiHeader({ name: 'x-paystack-signature', description: 'Paystack webhook signature' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook payload' })
  webhook(@Headers('x-paystack-signature') signature: string, @Body() payload: any) {
    // TODO: verify signature with PAYSTACK_WEBHOOK_SECRET if provided
    return this.checkoutService.handleWebhook(payload);
  }
}


