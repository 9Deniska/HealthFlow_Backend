import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecializationsModule } from '../specializations/specializations.module';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department]), SpecializationsModule],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
  controllers: [DepartmentsController],
})
export class DepartmentsModule {}
