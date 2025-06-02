import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard'; // Assuming JWT protection
import { CreateTimeTableDto } from './dto/create-time-table.dto';
import { TimeTableService } from './time-table.service';
// Potentially a DTO for query parameters for more complex validation/transformation
// import { FindTimeTableDto } from './dto/find-time-table.dto';

@Controller('timetable') // Path as per your request
@UseGuards(JwtAuthGuard) // Example: Protect all timetable routes
export class TimeTableController {
  constructor(private readonly timeTableService: TimeTableService) {}

  @Post('add')
  async create(
    @Body(new ValidationPipe()) createTimeTableDto: CreateTimeTableDto,
  ) {
    return this.timeTableService.create(createTimeTableDto);
  }

  @Get()
  async findAll(
    // If using a DTO for query params:
    // @Query(new ValidationPipe({ transform: true, whitelist: true })) query: FindTimeTableDto,
    @Query('doctorId', new ParseIntPipe({ optional: true })) doctorId?: number,
    @Query('date') date?: string, // Basic string validation, more robust with DTO + IsDateString
  ) {
    // if using DTO: return this.timeTableService.findAll(query.doctorId, query.date);
    return this.timeTableService.findAll(doctorId, date);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.timeTableService.remove(id);
  }

  // Add POST, PATCH, DELETE/:id for managing timetable entries as needed in the future
}
