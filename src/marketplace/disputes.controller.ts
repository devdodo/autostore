import { Body, Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/dispute.dto';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import { DisputeDto } from '../common/dto/entity.dto';

@ApiTags('Disputes')
@ApiBearerAuth('JWT-auth')
@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dispute' })
  @ApiResponse({ status: 201, description: 'Dispute created successfully', type: DisputeDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  create(@Req() req: any, @Body() dto: CreateDisputeDto) {
    const userId = req.user?.userId;
    return this.disputesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user disputes' })
  @ApiResponse({ status: 200, description: 'Disputes retrieved successfully', type: [DisputeDto] })
  listMine(@Req() req: any) {
    const userId = req.user?.userId;
    return this.disputesService.listByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute by ID' })
  @ApiResponse({ status: 200, description: 'Dispute retrieved successfully', type: DisputeDto })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  get(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId;
    return this.disputesService.getById(userId, id);
  }
}
