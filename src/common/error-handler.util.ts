import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export class ErrorHandlerUtil {
  private static readonly logger = new Logger(ErrorHandlerUtil.name);

  /**
   * Sanitizes error messages to prevent sensitive information leakage
   */
  static sanitizeError(error: any): { message: string; userMessage: string; statusCode: number } {
    // Log the full error for debugging
    this.logger.error('Error occurred:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
      meta: error?.meta,
    });

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(error);
    }

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return this.handlePrismaUnknownError(error);
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return {
        message: 'Database validation error',
        userMessage: 'Invalid data provided',
        statusCode: 400,
      };
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return {
        message: 'Database connection error',
        userMessage: 'Service temporarily unavailable',
        statusCode: 503,
      };
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      return {
        message: 'Database engine error',
        userMessage: 'Service temporarily unavailable',
        statusCode: 503,
      };
    }

    // Handle generic errors
    if (error instanceof Error) {
      // Check for common error patterns that might contain sensitive info
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
        return {
          message: 'Database connection error',
          userMessage: 'Service temporarily unavailable',
          statusCode: 503,
        };
      }

      if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        return {
          message: 'Permission denied',
          userMessage: 'Access denied',
          statusCode: 403,
        };
      }

      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        return {
          message: 'Resource not found',
          userMessage: 'Requested resource not found',
          statusCode: 404,
        };
      }

      if (errorMessage.includes('duplicate') || errorMessage.includes('unique constraint')) {
        return {
          message: 'Duplicate entry',
          userMessage: 'Resource already exists',
          statusCode: 409,
        };
      }

      if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        return {
          message: 'Validation error',
          userMessage: 'Invalid data provided',
          statusCode: 400,
        };
      }

      // Generic error fallback
      return {
        message: 'Internal server error',
        userMessage: 'An unexpected error occurred',
        statusCode: 500,
      };
    }

    // Unknown error type
    return {
      message: 'Unknown error',
      userMessage: 'An unexpected error occurred',
      statusCode: 500,
    };
  }

  private static handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          message: 'Unique constraint violation',
          userMessage: 'Resource already exists',
          statusCode: 409,
        };
      case 'P2025':
        return {
          message: 'Record not found',
          userMessage: 'Requested resource not found',
          statusCode: 404,
        };
      case 'P2003':
        return {
          message: 'Foreign key constraint violation',
          userMessage: 'Invalid reference provided',
          statusCode: 400,
        };
      case 'P2014':
        return {
          message: 'Invalid ID provided',
          userMessage: 'Invalid reference provided',
          statusCode: 400,
        };
      case 'P2021':
        return {
          message: 'Table does not exist',
          userMessage: 'Service temporarily unavailable',
          statusCode: 503,
        };
      case 'P2022':
        return {
          message: 'Column does not exist',
          userMessage: 'Service temporarily unavailable',
          statusCode: 503,
        };
      case 'P2016':
        return {
          message: 'Query interpretation error',
          userMessage: 'Invalid request',
          statusCode: 400,
        };
      case 'P2017':
        return {
          message: 'Records for relation not connected',
          userMessage: 'Invalid reference provided',
          statusCode: 400,
        };
      case 'P2018':
        return {
          message: 'Required connected records not found',
          userMessage: 'Invalid reference provided',
          statusCode: 400,
        };
      case 'P2019':
        return {
          message: 'Input error',
          userMessage: 'Invalid data provided',
          statusCode: 400,
        };
      case 'P2020':
        return {
          message: 'Value out of range',
          userMessage: 'Invalid data provided',
          statusCode: 400,
        };
      default:
        return {
          message: 'Database operation failed',
          userMessage: 'An error occurred while processing your request',
          statusCode: 500,
        };
    }
  }

  private static handlePrismaUnknownError(error: Prisma.PrismaClientUnknownRequestError) {
    // Log the full error for debugging
    this.logger.error('Prisma unknown error:', {
      message: error.message,
      clientVersion: error.clientVersion,
    });

    return {
      message: 'Database operation failed',
      userMessage: 'An error occurred while processing your request',
      statusCode: 500,
    };
  }

  /**
   * Wraps async operations with proper error handling
   */
  static async handleAsync<T>(
    operation: () => Promise<T>,
    context: string = 'Unknown operation'
  ): Promise<{ success: boolean; data?: T; error?: any; message?: string }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const sanitized = this.sanitizeError(error);
      this.logger.error(`Error in ${context}:`, error);
      return {
        success: false,
        error: sanitized.message,
        message: sanitized.userMessage,
      };
    }
  }
}
