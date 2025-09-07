import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; status: string; timestamp: string } {
    return {
      message: 'Auto Shop API is running!',
      status: 'success',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
