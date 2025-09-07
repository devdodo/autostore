import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    // Validate input
    if (!email || !pass || typeof email !== 'string' || typeof pass !== 'string') {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (email.trim() === '' || pass.trim() === '') {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Additional validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.usersService.findByEmail(email.trim());
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const match = await bcrypt.compare(pass, user.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...publicUser } = user;
    return publicUser;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}


