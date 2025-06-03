import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard'; // Assuming you want to protect these routes
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
// Add RolesGuard and @Roles if needed for specific endpoints

@Controller('appointments') // Path as per your request
@UseGuards(JwtAuthGuard) // Example: Protect all appointment routes
export class AppointmentsController {
  // Renaming to AppointmentsController
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('add')
  async create(
    @Body(new ValidationPipe()) createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  async findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.findOne(id);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appointmentsService.remove(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch()
  async markAsPaid(@Body('id') id: string) {
    return this.appointmentsService.markAsPaid(id);
  }
}
