import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { BaseResponse } from '../common/base-response';

export interface EmailTemplate {
  templateId: string;
  params: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly zeptoApiUrl = process.env.ZEPTO_API_URL || 'https://api.zeptomail.com/v1.1';
  private readonly zeptoApiKey = process.env.ZEPTO_API_KEY;

  async sendMail(to: string, subject: string, template: EmailTemplate): Promise<BaseResponse<null>> {
    try {
      if (!this.zeptoApiKey) {
        return { success: false, message: 'Zepto API key not configured' };
      }

      const response = await axios.post(
        `${this.zeptoApiUrl}/email/template`,
        {
          from: {
            address: process.env.MAIL_FROM || 'noreply@autoshop.com',
            name: process.env.MAIL_FROM_NAME || 'Auto Shop'
          },
          to: [{ email_address: { address: to } }],
          subject,
          template_id: template.templateId,
          merge_info: template.params
        },
        {
          headers: {
            'Authorization': `Zoho-enczapikey ${this.zeptoApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, message: 'Email sent' };
    } catch (error: any) {
      return { success: false, message: error?.response?.data?.message || error?.message || 'Email failed', error };
    }
  }

  async sendWelcomeEmail(to: string, fullName: string): Promise<BaseResponse<null>> {
    return this.sendMail(to, 'Welcome to Auto Shop!', {
      templateId: 'welcome',
      params: { fullName }
    });
  }

  async sendOrderConfirmationEmail(to: string, orderData: any): Promise<BaseResponse<null>> {
    return this.sendMail(to, 'Order Confirmation', {
      templateId: 'order_confirmation',
      params: orderData
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<BaseResponse<null>> {
    return this.sendMail(to, 'Password Reset', {
      templateId: 'password_reset',
      params: { resetLink }
    });
  }
}


