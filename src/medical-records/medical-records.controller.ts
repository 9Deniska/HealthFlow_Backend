import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard'; // Assuming JWT protection
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecordsService } from './medical-records.service';
// import { RolesGuard } from '../auth/guard/roles.guard'; // If specific roles are needed
// import { Roles } from '../auth/decorator/roles.decorator'; // For role-based access

@Controller('medical-card') // Path as per your request
@UseGuards(JwtAuthGuard) // Example: Protect all medical record routes
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    // Add authorization: Is the current user (client/doctor) allowed to see this record?
    return this.medicalRecordsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateMedicalRecordDto: UpdateMedicalRecordDto,
  ) {
    // Add authorization: Is the current user (doctor) allowed to update this record?
    return this.medicalRecordsService.update(id, updateMedicalRecordDto);
  }

  // Add POST for creation, GET for all (with filters), DELETE if needed
}
