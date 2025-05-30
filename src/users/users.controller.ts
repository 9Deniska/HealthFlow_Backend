import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get('profile')
  async getProfile(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.usersService.findById(userId);
  }


  @Patch('profile')
  async updateProfile(@Req() req: RequestWithUser, @Body() dto: UpdateUserDto) {
    const userId = req.user.sub;
    return this.usersService.update(userId, dto);
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
