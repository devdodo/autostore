import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com', type: String })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'User password', example: 'password123', type: String })
  @IsString()
  @MinLength(6)
  password!: string;
}


