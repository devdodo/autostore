import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ 
    description: 'User email address', 
    example: 'user@example.com',
    format: 'email',
    type: String
  })
  @IsEmail()
  email!: string;
}
