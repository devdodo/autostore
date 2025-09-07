import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { ResponseInterceptor } from './common/response.interceptor';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Serve static files for favicon requests
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Swagger configuration - only in development
  // if (process.env.NODE_ENV !== 'production') {
  if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'development') {
    const config = new DocumentBuilder()
      .setTitle('Auto Shop API')
      .setDescription('Complete API documentation for Auto Shop e-commerce platform')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Admin - Analytics', 'Admin analytics and reporting')
      .addTag('Admin - Users', 'Admin user management')
      .addTag('Admin - Products', 'Admin product management')
      .addTag('Admin - Orders', 'Admin order management')
      .addTag('Admin - Disputes', 'Admin dispute management')
      .addTag('Admin - Transactions', 'Admin transaction management')
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Cart', 'Shopping cart endpoints')
      .addTag('Checkout', 'Checkout and payment endpoints')
      .addTag('Disputes', 'Dispute management endpoints')
      .addTag('Orders', 'Order management endpoints')
      .addTag('Products', 'Product catalog endpoints')
      .addTag('Users', 'User management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: false,
      ignoreGlobalPrefix: false,
    });
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
      },
    });
  }

  // Optional: seed admin via Prisma if needed (disabled by default)
  await app.listen(3000);
  console.log('🚀 Application is running on: http://localhost:3000');
  console.log('📚 Swagger documentation: http://localhost:3000/api/docs');
}
bootstrap();
