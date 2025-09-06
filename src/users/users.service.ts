import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUser } from './entities/user.entity';
import { Role } from '../common/roles.enum';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponse } from '../common/base-response';

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
    try {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          fullName: dto.fullName,
          roles: dto.roles && dto.roles.length ? dto.roles : [Role.CUSTOMER],
        },
      });
      return { success: true, message: 'User created', data: this.toPublic(user) };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to create user', error };
    }
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findPublicById(id: string): Promise<BaseResponse<PublicUser>> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) return { success: false, message: 'User not found' };
      return { success: true, message: 'ok', data: this.toPublic(user) };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to fetch user', error };
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<BaseResponse<PublicUser>> {
    try {
      const existing = await this.prisma.user.findUnique({ where: { id } });
      if (!existing) return { success: false, message: 'User not found' };
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
      return { success: true, message: 'User updated', data: this.toPublic(updated) };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to update user', error };
    }
  }

  async remove(id: string): Promise<BaseResponse<null>> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return { success: true, message: 'User removed' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to remove user', error };
    }
  }

  private toPublic(user: any): PublicUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
  }
}


