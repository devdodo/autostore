import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  initiate(@Req() req: any) {
    return this.checkoutService.initiate(req.user.userId);
  }

  @Post('webhook')
  webhook(@Headers('x-paystack-signature') signature: string, @Body() payload: any) {
    // TODO: verify signature with PAYSTACK_WEBHOOK_SECRET if provided
    return this.checkoutService.handleWebhook(payload);
  }
}


