import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { BaseResponse } from './base-response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();
      message = (res && (res.message || res.error)) || exception.message;
      error = res;
    } else if (exception instanceof Error) {
      message = exception.message || message;
      error = { name: exception.name, stack: exception.stack };
    }

    const body: BaseResponse = {
      success: false,
      message,
      error,
    };

    response.status(status).json(body);
  }
}


