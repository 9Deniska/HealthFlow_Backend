import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorator/roles.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile/:id')
  async getProfile(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  @Patch('profile/:id')
  async updateProfile(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Get('manager-dashboard')
  @Roles('manager')
  getManagerDashboard(@Req() req: RequestWithUser) {
    return {
      message: 'Панель менеджера',
      userId: req.user.sub,
    };
  }

  @Get('moderator-dashboard')
  @Roles('moderator')
  getModeratorDashboard(@Req() req: RequestWithUser) {
    return {
      message: 'Панель модератора',
      userId: req.user.sub,
    };
  }

  @Get('doctor-dashboard')
  @Roles('doctor')
  getDoctorDashboard(@Req() req: RequestWithUser) {
    return {
      message: 'Панель лікаря',
      userId: req.user.sub,
    };
  }
}
