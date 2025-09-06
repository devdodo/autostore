# Error Handling System

This document describes the comprehensive error handling system implemented to prevent sensitive database and system information from being exposed to users.

## Overview

The error handling system consists of three main components:

1. **ErrorHandlerUtil** - Core utility for sanitizing and handling errors
2. **AllExceptionsFilter** - Global exception filter that catches all unhandled exceptions
3. **ErrorHandlerDecorator** - Decorator for easy implementation in services

## Components

### ErrorHandlerUtil

Located at `src/common/error-handler.util.ts`, this utility provides:

- **sanitizeError()** - Sanitizes error messages to prevent sensitive information leakage
- **handleAsync()** - Wraps async operations with proper error handling
- **Comprehensive Prisma error handling** - Maps Prisma errors to user-friendly messages

#### Prisma Error Mappings

| Prisma Error Code | User Message | HTTP Status |
|------------------|--------------|-------------|
| P2002 | Resource already exists | 409 |
| P2025 | Requested resource not found | 404 |
| P2003 | Invalid reference provided | 400 |
| P2014 | Invalid reference provided | 400 |
| P2021 | Service temporarily unavailable | 503 |
| P2022 | Service temporarily unavailable | 503 |
| P2016 | Invalid request | 400 |
| P2017 | Invalid reference provided | 400 |
| P2018 | Invalid reference provided | 400 |
| P2019 | Invalid data provided | 400 |
| P2020 | Invalid data provided | 400 |

### AllExceptionsFilter

Located at `src/common/all-exceptions.filter.ts`, this global filter:

- Catches all unhandled exceptions
- Logs full error details for debugging
- Returns sanitized error messages to users
- Never exposes internal error details in responses

### ErrorHandlerDecorator

Located at `src/common/error-handler.decorator.ts`, this decorator:

- Automatically handles errors in service methods
- Ensures all database errors are properly sanitized
- Can be applied to any async method

## Usage Examples

### Using ErrorHandlerUtil in Services

```typescript
import { ErrorHandlerUtil } from '../common/error-handler.util';

export class MyService {
  async createUser(dto: CreateUserDto): Promise<BaseResponse<User>> {
    const result = await ErrorHandlerUtil.handleAsync(async () => {
      // Your database operations here
      const user = await this.prisma.user.create({
        data: dto
      });
      return this.toPublic(user);
    }, 'User creation');

    if (result.success) {
      return { success: true, message: 'User created', data: result.data };
    } else {
      return { success: false, message: result.message || 'Failed to create user' };
    }
  }
}
```

### Using the Decorator

```typescript
import { HandleErrors } from '../common/error-handler.decorator';

export class MyService {
  @HandleErrors('User creation')
  async createUser(dto: CreateUserDto): Promise<BaseResponse<User>> {
    // Your database operations here
    const user = await this.prisma.user.create({
      data: dto
    });
    return { success: true, message: 'User created', data: this.toPublic(user) };
  }
}
```

## Security Features

### What Gets Logged (Server-side)
- Full error messages
- Stack traces
- Error codes and metadata
- Request context (URL, method, user agent, IP)
- Prisma error details

### What Gets Sent to Users
- Sanitized, user-friendly error messages
- Appropriate HTTP status codes
- No sensitive database information
- No stack traces
- No internal error details

## Error Categories

### Database Errors
- Connection issues → "Service temporarily unavailable"
- Validation errors → "Invalid data provided"
- Constraint violations → "Resource already exists" or "Invalid reference provided"
- Not found errors → "Requested resource not found"

### Authentication/Authorization Errors
- Permission denied → "Access denied"
- Invalid credentials → "Invalid credentials"

### Validation Errors
- Input validation → "Invalid data provided"
- Business logic validation → Custom messages

### System Errors
- Unknown errors → "An unexpected error occurred"
- Service unavailable → "Service temporarily unavailable"

## Implementation Checklist

When implementing error handling in a new service:

1. ✅ Import `ErrorHandlerUtil` from `../common/error-handler.util`
2. ✅ Wrap database operations in `ErrorHandlerUtil.handleAsync()`
3. ✅ Use appropriate exceptions (e.g., `NotFoundException`, `BadRequestException`)
4. ✅ Return `BaseResponse` format consistently
5. ✅ Never expose raw error objects to users
6. ✅ Test error scenarios to ensure proper sanitization

## Testing Error Handling

To test the error handling system:

1. **Database Connection Issues**: Temporarily disconnect the database
2. **Invalid Data**: Send malformed requests
3. **Constraint Violations**: Try to create duplicate resources
4. **Not Found Scenarios**: Request non-existent resources
5. **Permission Errors**: Test with insufficient permissions

## Monitoring and Debugging

- All errors are logged with full context
- Use the logs to identify and fix issues
- Monitor error patterns to improve user experience
- Never rely on user-facing error messages for debugging

## Best Practices

1. **Always use the error handling utility** for database operations
2. **Throw appropriate exceptions** rather than returning error responses
3. **Log everything** but expose nothing sensitive
4. **Test error scenarios** thoroughly
5. **Keep error messages user-friendly** and actionable
6. **Use consistent error response format** across all endpoints

## Migration Guide

To migrate existing services to use the new error handling:

1. Import `ErrorHandlerUtil`
2. Replace try-catch blocks with `ErrorHandlerUtil.handleAsync()`
3. Remove direct error object exposure
4. Update error messages to be user-friendly
5. Test thoroughly

This system ensures that your application is secure and provides a good user experience while maintaining comprehensive logging for debugging purposes.
