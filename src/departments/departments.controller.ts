import { Controller, Get, Param } from '@nestjs/common';
import { SpecializationsService } from 'src/specializations/specializations.service';
import { DepartmentsService } from './departments.service';

@Controller('departments')
export class DepartmentsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
    private readonly specializationsService: SpecializationsService,
  ) {}

  @Get()
  async findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id/specializations')
  async findSpecializations(@Param('id') id: number) {
    return this.specializationsService.findAll(id);
  }
}
