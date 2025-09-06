import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { BaseResponseDto } from '../common/dto/base-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: BaseResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() dto: RegisterDto) {
    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      fullName: dto.fullName,
    });
    return user;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful', type: BaseResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    const validated = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(validated);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Reset link sent if email exists', type: BaseResponseDto })
  async forgot(@Body() body: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(body.email);
    
    if (!user) return { success: true, message: 'If the email exists, a reset link will be sent' };
    
    const token = randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 30);
    
    await this.prisma.$transaction((tx) =>
      this.prisma.passwordResetToken.create({ data: { userId: (user as any).id, token, expiresAt: expires } }),
    );
    await this.emailService.sendPasswordResetEmail(user.email, `${process.env.FRONTEND_URL}/reset-password?token=${token}`);

    return { success: true, message: 'Reset link generated', data: { token } };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful', type: BaseResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async reset(@Body() body: ResetPasswordDto) {
    const record = await this.prisma.$transaction((tx) => this.prisma.passwordResetToken.findUnique({ where: { token: body.token } }));

    if (!record || record.used || record.expiresAt < new Date()) return { success: false, message: 'Invalid or expired token' };
    const user = await this.usersService.findByEmail((await this.prisma.user.findUnique({ where: { id: record.userId } }))!.email);
    if (!user) return { success: false, message: 'User not found' };
    
    await this.usersService.update((user as any).id, { password: body.password } as any);
    await this.prisma.$transaction((tx) => tx.passwordResetToken.update({ where: { token: body.token }, data: { used: true } }));
    
    return { success: true, message: 'Password reset successful' };
  }
}


