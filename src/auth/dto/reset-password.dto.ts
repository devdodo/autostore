import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ 
    description: 'Password reset token', 
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @IsString()
  token!: string;

  @ApiProperty({ 
    description: 'New password (minimum 6 characters)', 
    example: 'newpassword123',
    minLength: 6,
    type: String
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
