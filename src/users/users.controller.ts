import { Body, Controller, Get, Patch, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from '../marketplace/orders.service';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import { UserDto, OrderDto } from '../common/dto/entity.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
  ) {}

  // Profile endpoints use JWT to identify the user
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully', type: UserDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@Req() req: any) {
    const userId = req.user?.userId;
    return this.usersService.findPublicById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User profile updated successfully', type: UserDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    const userId = req.user?.userId;
    return this.usersService.update(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: 200, description: 'User orders retrieved successfully', type: [OrderDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  orders(@Req() req: any) {
    const userId = req.user?.userId;
    return this.ordersService.listByUser(userId);
  }
}


