import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse } from './base-response';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, BaseResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<BaseResponse<T>> {
    return next.handle().pipe(
      map((data: any) => {
        if (data && typeof data === 'object' && 'success' in data && 'message' in data) {
          return data as BaseResponse<T>;
        }
        return { success: true, message: 'ok', data } as BaseResponse<T>;
      }),
    );
  }
}


