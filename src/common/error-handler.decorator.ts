import { ErrorHandlerUtil } from './error-handler.util';

/**
 * Decorator to automatically handle errors in service methods
 * This ensures all database errors are properly sanitized and logged
 */
export function HandleErrors(context?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const operationContext = context || `${target.constructor.name}.${propertyName}`;
      
      const result = await ErrorHandlerUtil.handleAsync(async () => {
        return await method.apply(this, args);
      }, operationContext);

      // If the method returns a BaseResponse, handle it appropriately
      if (result.success && result.data && typeof result.data === 'object' && 'success' in result.data) {
        // If the method already returns a BaseResponse, return it as is
        return result.data;
      }

      // If the method returns data directly, wrap it in BaseResponse
      if (result.success) {
        return {
          success: true,
          message: 'Operation completed successfully',
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Operation failed',
        };
      }
    };
  };
}
