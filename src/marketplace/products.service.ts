import { Injectable } from '@nestjs/common';
import { BaseResponse } from '../common/base-response';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  sku: string;
  make?: string;
  model?: string;
  year?: number;
  brand?: string;
  carName?: string;
  bodyType?: string;
  engine?: string;
  horsepower?: string;
  fuelType?: string;
  fuelCapacity?: string;
  engineDisplacement?: string;
  rpm?: string;
  carPrice?: string;
  carLocation?: string;
  transmission?: string;
  colour?: string;
  mileage?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  list(filters?: {
    search?: string;
    make?: string;
    model?: string;
    year?: number;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }): BaseResponse<Product[]> {
    try {
      const where: any = {};
      
      // Search filter
      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { make: { contains: filters.search, mode: 'insensitive' } },
          { model: { contains: filters.search, mode: 'insensitive' } }
        ];
      }
      
      // Make filter
      if (filters?.make) {
        where.make = { contains: filters.make, mode: 'insensitive' };
      }
      
      // Model filter
      if (filters?.model) {
        where.model = { contains: filters.model, mode: 'insensitive' };
      }
      
      // Year filter
      if (filters?.year) {
        where.year = filters.year;
      }
      
      // Price range filter
      if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
        where.price = {};
        if (filters?.minPrice !== undefined) {
          where.price.gte = filters.minPrice;
        }
        if (filters?.maxPrice !== undefined) {
          where.price.lte = filters.maxPrice;
        }
      }

      const limit = filters?.limit || 100;
      const offset = filters?.offset || 0;

      // @ts-ignore using Prisma model; Product interface kept for shape hint
      return this.prisma.product
        .findMany({ 
          where,
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' } 
        })
        .then((rows: any) => ({ success: true, message: 'ok', data: rows }))
        .catch((error: any) => ({ success: false, message: error?.message || 'Failed to list products', error }));
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to list products', error };
    }
  }

  get(id: string): BaseResponse<Product> {
    try {
      // @ts-ignore using Prisma model
      return this.prisma.product
        .findUnique({ where: { id } })
        .then((p: any) => (p ? { success: true, message: 'ok', data: p } : { success: false, message: 'Product not found' }))
        .catch((error: any) => ({ success: false, message: error?.message || 'Failed to get product', error }));
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to get product', error };
    }
  }

  async create(dto: CreateProductDto): Promise<BaseResponse<any>> {
    try {
      const created = await this.prisma.product.create({ data: dto as any });
      const allProducts = await this.prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return { 
        success: true, 
        message: 'Product created', 
        data: {
          product: created,
          allProducts: allProducts
        }
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to create product', error };
    }
  }

  async update(id: string, dto: UpdateProductDto): Promise<BaseResponse<any>> {
    try {
      const updated = await this.prisma.product.update({ where: { id }, data: dto as any });
      return { success: true, message: 'Product updated', data: updated };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to update product', error };
    }
  }

  async remove(id: string): Promise<BaseResponse<null>> {
    try {
      await this.prisma.product.delete({ where: { id } });
      return { success: true, message: 'Product removed' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to remove product', error };
    }
  }
}


