import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseResponse } from './base-response';
import { ErrorHandlerUtil } from './error-handler.util';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Log the full error for debugging
    this.logger.error('Exception caught:', {
      exception,
      url: request.url,
      method: request.method,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    });

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();
      
      // For validation errors, return the validation message
      if (status === HttpStatus.BAD_REQUEST && res && Array.isArray(res.message)) {
        message = res.message.join(', ');
      } else {
        message = (res && (res.message || res.error)) || exception.message;
      }
      
      // Don't expose internal error details
      error = status < 500 ? res : undefined;
    } else {
      // Use the error handler utility for all other errors
      const sanitized = ErrorHandlerUtil.sanitizeError(exception);
      status = sanitized.statusCode;
      message = sanitized.userMessage;
      error = undefined; // Never expose internal error details to users
    }

    const body: BaseResponse = {
      success: false,
      message,
      error,
    };

    response.status(status).json(body);
  }
}


