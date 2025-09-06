import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddItemDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}


