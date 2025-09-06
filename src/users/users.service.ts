import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUser } from './entities/user.entity';
import { Role } from '../common/roles.enum';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponse } from '../common/base-response';
import { ErrorHandlerUtil } from '../common/error-handler.util';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async seedAdminIfMissing(): Promise<void> {
    const admin = await this.prisma.user.findFirst({ where: { roles: { has: Role.ADMIN } } });
    if (!admin) {
      await this.create({
        email: 'admin@example.com',
        password: 'Admin123!@#',
        fullName: 'Admin User',
        roles: [Role.ADMIN],
      });
    }
  }

  async create(dto: CreateUserDto): Promise<BaseResponse<PublicUser>> {
    // Validate input data
    if (!dto.email || !dto.password || !dto.fullName) {
      return { success: false, message: 'Missing required fields' };
    }
    
    if (dto.email.trim() === '' || dto.password.trim() === '' || dto.fullName.trim() === '') {
      return { success: false, message: 'Fields cannot be empty' };
    }

    const result = await ErrorHandlerUtil.handleAsync(async () => {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      
      // Ensure roles array contains valid Role enum values
      const validRoles = dto.roles && dto.roles.length > 0 
        ? dto.roles.filter(role => Object.values(Role).includes(role))
        : [Role.CUSTOMER];
      
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.trim(),
          passwordHash,
          fullName: dto.fullName.trim(),
          roles: validRoles,
        },
      });
      
      return this.toPublic(user);
    }, 'User creation');

    if (result.success) {
      return { success: true, message: 'User created', data: result.data };
    } else {
      return { success: false, message: result.message || 'Failed to create user' };
    }
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findPublicById(id: string): Promise<BaseResponse<PublicUser>> {
    const result = await ErrorHandlerUtil.handleAsync(async () => {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');
      return this.toPublic(user);
    }, 'Find user by ID');

    if (result.success) {
      return { success: true, message: 'ok', data: result.data };
    } else {
      return { success: false, message: result.message || 'Failed to fetch user' };
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<BaseResponse<PublicUser>> {
    const result = await ErrorHandlerUtil.handleAsync(async () => {
      const existing = await this.prisma.user.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('User not found');
      
      let passwordHash = existing.passwordHash;
      if ((dto as any).password) passwordHash = await bcrypt.hash((dto as any).password, 10);
      
      const updated = await this.prisma.user.update({
        where: { id },
        data: {
          email: (dto as any).email ?? existing.email,
          fullName: (dto as any).fullName ?? existing.fullName,
          roles: (dto as any).roles ?? existing.roles,
          passwordHash,
        },
      });
      
      return this.toPublic(updated);
    }, 'Update user');

    if (result.success) {
      return { success: true, message: 'User updated', data: result.data };
    } else {
      return { success: false, message: result.message || 'Failed to update user' };
    }
  }

  async remove(id: string): Promise<BaseResponse<null>> {
    const result = await ErrorHandlerUtil.handleAsync(async () => {
      const existing = await this.prisma.user.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('User not found');
      
      await this.prisma.user.delete({ where: { id } });
      return null;
    }, 'Remove user');

    if (result.success) {
      return { success: true, message: 'User removed' };
    } else {
      return { success: false, message: result.message || 'Failed to remove user' };
    }
  }

  private toPublic(user: any): PublicUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
  }
}


