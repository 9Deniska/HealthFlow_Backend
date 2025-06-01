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
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecordsService } from './medical-records.service';

@Controller('medical-card')
@UseGuards(JwtAuthGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get(':id')
  async findAllMedicalCardsForClient(
    @Param('id', ParseIntPipe) clientId: number,
  ) {
    return this.medicalRecordsService.findAllByClientId(clientId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateMedicalRecordDto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.update(id, updateMedicalRecordDto);
  }
}
