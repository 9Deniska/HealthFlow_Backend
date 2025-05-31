import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '../auth/decorator/roles.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { DoctorsService } from '../doctors/doctors.service';
import { CreateDoctorDto } from '../doctors/dto/create-doctor.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly doctorsService: DoctorsService,
  ) {}

  @Post('doctors')
  async createDoctor(
    @Body(new ValidationPipe()) createDoctorDto: CreateDoctorDto,
  ) {
    return this.doctorsService.create(createDoctorDto);
  }

  @Get('profile/:id')
  async getProfile(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  @Get('doctors/')
  async getDoctors() {
    return this.doctorsService.findAll();
  }

  @Get('doctors/:id')
  async getDoctor(@Param('id') id: number) {
    return this.doctorsService.findOneById(id);
  }

  @Delete('doctors/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDoctor(@Param('id') id: number): Promise<void> {
    return this.doctorsService.remove(id);
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
